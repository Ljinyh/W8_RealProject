const Room = require('../models/room');
const User = require('../models/user');
const Savelist = require('../models/savelist');
const Store = require('../models/store');
const UsersRoom = require('../models/usersRoom');
const Matmadi = require('../models/matmadi');
const Like = require('../models/like');
const Tag = require('../models/tag');

module.exports = {
    // 지도에 맛집 보여주기 (현재 위치기반 검색)
    mapViewer: async (req, res) => {
        const { lon, lat, distance } = req.query;
        const { tag } = req.body;
        try {
            //사용자의 현재위치 2km반경 내의 맛집 전체 검색
            const allStore = [];
            if (lat !== undefined && lon !== undefined && tag !== undefined) {
                for (i = 0; i < tag.length; i++) {
                    allStore.push(
                        ...(await Store.find({
                            mainTag: tag[i],
                            location: {
                                $near: {
                                    //해당하는 포인트로부터 최대 범위. 1000 = 1km, 2000 = 2km
                                    $maxDistance: 2000, //distance를 받아서 사용자가 고르게 해도 좋을듯
                                    $geometry: {
                                        type: 'Point',
                                        coordinates: [lon, lat],
                                    },
                                },
                            },
                        }))
                    );
                }
            } else if (
                lat !== undefined &&
                lon !== undefined &&
                tag === undefined
            ) {
                allStore.push(
                    ...(await Store.find({
                        location: {
                            $near: {
                                //해당하는 포인트로부터 최대 범위. 1000 = 1km, 2000 = 2km
                                $maxDistance: 2000,
                                $geometry: {
                                    type: 'Point',
                                    coordinates: [lon, lat],
                                },
                            },
                        },
                    }))
                );
            } else {
                allStore.push(...(await Store.find()));
            }

            const storeMap = [];
            for (i = 0; i < allStore.length; i++) {
                findUser = await User.findById(allStore[i].userId);
                storeMap.push({
                    storeId: allStore[i].storeId,
                    storeName: allStore[i].storeName,
                    address: allStore[i].address,
                    lon: allStore[i].location.coordinates[0],
                    lat: allStore[i].location.coordinates[1],
                    tag: allStore[i].mainTag,
                    nickname: findUser.nickname,
                    faceColor: findUser.faceColor,
                    eyes: findUser.eyes,
                });
            }
            res.status(200).send({
                result: true,
                message: '지도에 맛집 보여주기 성공',
                storeMap: storeMap,
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '지도에 맛집 보여주기 실패',
            });
        }
    },
    // 맛방에 맛집 저장
    saveStore: async (req, res) => {
        const { userId } = res.locals.user;
        const { storeId, selectedRooms } = req.body;
        try {
            // 존재하는 맛집 id인지 확인
            const theStore = await Store.findById(storeId).exec();
            if (!theStore) {
                return res.status(400).send({
                    errorMessage: '존재하지 않는 맛집입니다.',
                });
            }
            // 사용자가 선택한 맛방이 존재하는 맛방인지 확인
            for (i = 0; i < selectedRooms.length; i++) {
                existRoom = await Room.findById(selectedRooms[i]);
                if (!existRoom) {
                    return res.status(400).send({
                        errorMessage: '존재하지 않는 맛방입니다.',
                    });
                }
            }
            // 사용자의 Savelist에서 해당 가게를 저장한 데이터 전체 찾아서 지우기
            const findRoomSavelist = await Savelist.find({ storeId, userId });
            for (i = 0; i < findRoomSavelist.length; i++) {
                await Savelist.findByIdAndDelete(findRoomSavelist[i].id);
            }
            // 사용자가 선택한 roomId로 Savelist 다시 생성
            for (i = 0; i < selectedRooms.length; i++) {
                await Savelist.create({
                    userId,
                    roomId: selectedRooms[i],
                    storeId,
                    createdAt: Date.now(),
                });
            }
            res.status(200).send({
                result: true,
                message: '맛방에 맛집 저장 완료',
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '맛집 기록 실패' });
        }
    },

    // 맛집 생성 (첫 기록하기), 방장의 맛방에 맛집 추가까지
    createStore: async (req, res) => {
        const { userId } = res.locals.user; // JWT 인증 정보
        const { storeName, address, tag } = req.body;
        const { lon, lat } = req.body;

        try {
            // 이미 저장한 맛집인지 체크
            const existStore = await Store.findOne({ storeName });
            if (
                existStore !== null &&
                existStore.storeName === storeName &&
                existStore.address === address
            ) {
                return res
                    .status(400)
                    .send({ errorMessage: '이미 저장된 맛집입니다.' });
            }
            // 정보를 가게 DB에 저장
            const save = await Store.create({
                userId,
                storeName,
                address,
                location: { type: 'Point', coordinates: [lon, lat] },
                mainTag: tag,
                createdAt: Date.now(),
            });

            res.status(200).send({
                result: true,
                storeId: save.storeId,
                message: '맛집 기록 완료',
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '맛집 기록 실패' });
        }
    },

    // 맛집 상세 조회 말풍선 (내가 소속된 맛방별로 검색)
    detailStore: async (req, res) => {
        const { storeId } = req.params;

        try {
            const existStore = await Store.findById(storeId);
            const storefinder = await User.findById(existStore.userId);
            const list = await Savelist.find({ storeId: storeId });
            let allStarArr = []; // null 값이 들어오면 에러가 나기 때문에 빈 배열 선언
            allStarArr = list.map((a) => a.star);
            const starAvg =
                allStarArr.reduce(function add(sum, currValue) {
                    return sum + currValue;
                }, 0) / allStarArr.length;

            res.status(200).send({
                message: '맛집 정보 조회 완료',
                result: {
                    storeId,
                    storeName: existStore.storeName,
                    nickname: storefinder.nickname,
                    faceColor: storefinder.faceColor,
                    eyes: storefinder.eyes,
                    tag: existStore.mainTag,
                    // starAvg : Math.round(starAvg), //소수점 반올림 정수 반환
                    starAvg: Math.round(starAvg * 2) / 2, // 소수점 0.5 단위로 반올림 반환
                    comment: existStore.comment,
                },
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '맛집 정보 조회 실패',
            });
        }
    },
    // 사용자의 맛방 목록 조회 (내가 소속된 맛방 별로 검색)
    allMatBang: async (req, res) => {
        const { userId } = res.locals.user;
        try {
            //userRoom 데이터 테이블에서 찾기
            const existRoom = await UsersRoom.findOne({
                userId: userId,
            }).exec();

            if (!existRoom) {
                return res.status(200).send({
                    result: true,
                    total: 0,
                    myRooms: [],
                    Message: '사용자의 방이 존재하지 않습니다',
                });
            }

            // roomSeq로 RoomDB에서 정보찾기. 배열로 생성
            const arrTheRoom = [];
            const storeNum = [];
            for (i = 0; i < existRoom.roomSeq.length; i++) {
                roomInfo = await Room.findById(existRoom.roomSeq[i]);
                allStorelist = await Savelist.find({
                    roomId: existRoom.roomSeq[i],
                });
                arrTheRoom.push(roomInfo);
                storeNum.push(allStorelist.length); // 맛방에 등록된 맛집 개수
            }

            // 방 목록 배열에, 조건에 해당하는 status 키값 집어넣기
            let status = '';
            const myroom = [];
            const counter = [];
            for (let i = 0; i < arrTheRoom.length; i++) {
                const name = arrTheRoom[i];

                const ownerCheck = name.ownerId === userId;
                const guestCheck = name.guestId.includes(userId);
                const guestNumCheck = name.guestId.length;

                if (ownerCheck && guestNumCheck === 0) {
                    status = 'private';
                } else if (!ownerCheck && guestCheck) {
                    status = 'publicGuest';
                } else if (ownerCheck && !guestCheck) {
                    status = 'publicOwner';
                }
                myroom.push(status);
                // 하나씩 증가하는 숫자 넣어서 주기
                counter.push(i);
            }

            const result = arrTheRoom.map((room, idx) => ({
                order: counter[idx],
                roomId: room.roomId,
                roomName: room.roomName,
                emoji: room.emoji,
                ownerId: room.ownerId,
                guestId: room.guestId,
                memberNum: room.guestId.length + 1,
                status: myroom[idx],
                roomCode: room.roomCode,
                storeNum: storeNum[idx],
            }));

            res.status(200).send({
                result: true,
                total: existRoom.roomSeq.length,
                myRooms: result,
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '맛방 목록 조회 실패',
            });
        }
    },
    // 특정 맛방의 맛집 태그 아이콘
    roomTagIcon: async (req, res) => {
        const { roomId } = req.params;
        try {
            //
            const findStoreList = await Savelist.find({ roomId });

            // 맛방에 등록된 맛집리스트 찾기
            const findStoreInfo = []; // 맛집의 정보를 순서대로 쌓는다.
            const findUserIcon = []; // 처음 등록한 유저의 정보를 맛집 순서대로 쌓는다.
            const findStarAvg = []; // 별점 평균을 맛집의 순서대로 쌓는다.

            for (let i = 0; i < findStoreList.length; i++) {
                let stores = await Store.findById(findStoreList[i].storeId);
                let users = await User.findById(findStoreList[i].userId);
                findStoreInfo.push(stores);
                findUserIcon.push(users);

                // 해당 맛집의 모든 맛마디 찾기.
                const list = await Matmadi.find({
                    storeId: findStoreList[i].storeId,
                });
                // 모든 맛마디의 star 값들을 평균으로 계산 출력
                let allStarArr = []; // null 값이 들어오면 에러가 나기 때문에 빈 배열 선언
                allStarArr = list.map((a) => a.star);
                // 배열의 평균 구하기
                const starAvg =
                    allStarArr.reduce(function add(sum, currValue) {
                        return sum + currValue;
                    }, 0) / allStarArr.length;
                //평균의 소수자리를 0.5 단위로 반올림해서 출력
                if (starAvg) {
                    findStarAvg.push(Math.round(starAvg * 2) / 2);
                } else {
                    findStarAvg.push(0); // 등록한 리뷰(별점)가 없다면 0를 표시한다.
                }
            }

            const result = findStoreList.map((a, idx) => ({
                storeId: a.storeId,
                storeName: findStoreInfo[idx].storeName,
                lon: findStoreInfo[idx].location.coordinates[0],
                lat: findStoreInfo[idx].location.coordinates[1],
                nickname: findUserIcon[idx].nickname,
                faceColor: findUserIcon[idx].faceColor,
                eyes: findUserIcon[idx].eyes,
                starAvg: findStarAvg[idx],
                tag: findStoreInfo[idx].mainTag[0],
                comment: findStoreInfo[idx].mainComment, //첫 기록하기의 코멘트
            }));
            return res.status(200).send({
                result: result,
                message: '맛방의 맛집 조회 완료',
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },

    // 리뷰 남기기 (맛마디 작성)
    writeMatmadi: async (req, res) => {
        const { userId } = res.locals.user;
        const { storeId } = req.params;
        const {
            comment,
            star,
            imgURL,
            tagMenu,
            tagTasty,
            tagPoint,
            ratingTasty,
            ratingPrice,
            ratingService,
        } = req.body;
        try {
            // 이미 리뷰를 작성했는지 확인. 리뷰 작성이 방문 횟수를 의미한다면 리뷰는 중복작성 가능해야 한다.
            const existMatmadi = await Matmadi.findOne({ userId, storeId });
            if (existMatmadi) {
                return res.status(400).send({
                    result: false,
                    message: '사용자가 이미 리뷰를 작성했습니다.',
                });
            }

            // 태그 DB에 해당 태그 데이터가 있는지 확인하고 없으면 create
            for (i = 0; i < tagMenu.length; i++) {
                let arrValue = tagMenu[i];
                let findTag = await Tag.findOne({ tagMenu: arrValue });
                if (findTag === null) {
                    await Tag.create({
                        storeId,
                        tagMenu: arrValue,
                        category: 'menu',
                    });
                }
            }
            for (i = 0; i < tagTasty.length; i++) {
                let arrValue = tagTasty[i];
                let findTag = await Tag.findOne({ tagTasty: arrValue });
                if (findTag === null) {
                    await Tag.create({
                        storeId,
                        tagTasty: arrValue,
                        category: 'tasty',
                    });
                }
            }
            for (i = 0; i < tagPoint.length; i++) {
                let arrValue = tagPoint[i];
                let findTag = await Tag.findOne({ tagPoint: arrValue });
                if (findTag === null) {
                    await Tag.create({
                        storeId,
                        tagPoint: arrValue,
                        category: 'point',
                    });
                }
            }

            await Matmadi.create({
                storeId,
                userId,
                comment,
                star,
                imgURL,
                tagMenu,
                tagTasty,
                tagPoint,
                ratingTasty,
                ratingPrice,
                ratingService,
                createdAt: new Date(),
            });

            // 사용자가 해당 맛집을 "첫 기록하기"하는 유저라면 Store에 메인코멘트 추가
            await Store.findOneAndUpdate(
                { userId, storeId },
                { $set: { mainComment: comment } }
            );
            return res
                .status(200)
                .send({ result: true, message: '리뷰 작성 완료!' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '리뷰 작성 실패' });
        }
    },

    // 맛마디 전체 조회
    allMatmadi: async (req, res) => {
        const { storeId } = req.params;
        const { userId } = res.locals.user;
        try {
            const existMatmadi = await Matmadi.find({ storeId });

            //리뷰별 좋아요 갯수 찾아서 배열에 넣음.
            const likeNum = [];
            const likeDone = [];
            for (i = 0; i < existMatmadi.length; i++) {
                likes = await Like.find({ madiId: existMatmadi[i].madiId });
                likeNum.push(likes.length);

                // 현재 사용자가 리뷰에 좋아요를 눌렀는지 확인. {likeDone : true || false}
                userlike = await Like.find({
                    madiId: existMatmadi[i].madiId,
                    userId: userId,
                });
                likeDone.push(!!userlike.length); //느낌표 두개는 Number를 Boolean으로 변환한다.
            }

            // map 함수로 찾은 리뷰 데이터와 좋아요 개수 출력
            const result = existMatmadi.map((a, idx) => ({
                madiId: a.madiId,
                imgURL: a.imgURL,
                comment: a.comment,
                star: a.star,
                likeNum: likeNum[idx],
                likeDone: likeDone[idx],
                faceColor: a.faceColor,
                eyes: a.eyes,
            }));

            return res.status(200).send({
                // likeNum(좋아요) 많은 순서로 배열 정렬
                result: result.sort(
                    (a, b) => parseFloat(a.likeNum) - parseFloat(b.likeNum)
                ),
                message: '리뷰 전체 조회 완료',
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '리뷰 전체 조회 실패',
            });
        }
    },
    // 맛마디 상세 조회
    detailMatmadi: async (req, res) => {
        const { userId } = res.locals.user;
        const { madiId } = req.params;
        try {
            const existMatmadi = await Matmadi.findById(madiId);
            const author = await User.findById(existMatmadi.userId);
            const likes = await Like.find({ madiId });

            // 사용자가 좋아요 했는지 확인. 좋아요 눌렀으면 1==true || 0==false
            const userlike = await Like.find({
                madiId: madiId,
                userId: userId,
            });

            const result = {
                imgURL: existMatmadi.imgURL,
                comment: existMatmadi.comment,
                star: existMatmadi.star,
                likeNum: likes.length,
                likeDone: !!userlike.length, //느낌표 두개는 숫자 1과 0을 boolean으로 변환한다.
                nickname: author.nickname,
                faceColor: author.faceColor,
                eyes: author.eyes,
                createdAt: existMatmadi.createdAt,
            };
            return res
                .status(200)
                .send({ result: result, message: '리뷰 상세조회 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '리뷰 상세조회 실패',
            });
        }
    },
    // 맛마디 수정
    // 리뷰 수정시 태그가 바뀌는데, 지운 태그가 태그DB의 마지막 태그라면 데이터를 지워야한다.
    updateMatmadi: async (req, res) => {
        const { userId } = res.locals.user;
        const { madiId } = req.params;
        const {
            comment,
            star,
            imgURL,
            tagMenu,
            tagTasty,
            tagPoint,
            ratingTasty,
            ratingPrice,
            ratingService,
        } = req.body;
        try {
            // 사용자가 작성한 리뷰인지 확인
            const existMatmadi = await Matmadi.findById(madiId);
            if (userId !== existMatmadi.userId) {
                return res.status(400).send({
                    result: false,
                    message: '사용자 작성한 리뷰가 아닙니다.',
                });
            }
            //해당 리뷰를 찾아서 업데이트
            await Matmadi.findByIdAndUpdate(
                { _id: madiId },
                {
                    $set: {
                        comment,
                        star,
                        imgURL,
                        tagMenu,
                        tagTasty,
                        tagPoint,
                        ratingTasty,
                        ratingPrice,
                        ratingService,
                    },
                }
            );
            // 태그 DB에 해당 태그 데이터가 있는지 확인하고 없으면 create
            for (i = 0; i < tagMenu.length; i++) {
                let arrValue = tagMenu[i];
                let findTag = await Tag.findOne({ tagMenu: arrValue });
                if (findTag === null) {
                    await Tag.create({
                        storeId,
                        tagMenu: arrValue,
                        category: 'menu',
                    });
                }
            }
            for (i = 0; i < tagTasty.length; i++) {
                let arrValue = tagTasty[i];
                let findTag = await Tag.findOne({ tagTasty: arrValue });
                if (findTag === null) {
                    await Tag.create({
                        storeId,
                        tagTasty: arrValue,
                        category: 'tasty',
                    });
                }
            }
            for (i = 0; i < tagPoint.length; i++) {
                let arrValue = tagPoint[i];
                let findTag = await Tag.findOne({ tagPoint: arrValue });
                if (findTag === null) {
                    await Tag.create({
                        storeId,
                        tagPoint: arrValue,
                        category: 'point',
                    });
                }
            }
            return res
                .status(200)
                .send({ result: true, message: '리뷰 수정 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '리뷰 수정 실패' });
        }
    },
    // 맛마디 삭제
    // 삭제할 태그는 배열로 저장되어있지만 TagDB는 일반 문자열 데이터임.
    deleteMatmadi: async (req, res) => {
        const { userId } = res.locals.user;
        const { madiId } = req.params;
        try {
            const existMatmadi = await Matmadi.findById(madiId);
            if (userId !== existMatmadi.userId) {
                return res.status(400).send({
                    result: false,
                    message: '사용자가 작성한 리뷰가 아닙니다.',
                });
            }

            // 사용자의 태그 삭제가 태그 DB의 마지막 데이터일 때, 태그 DB의 데이터 삭제
            for (i = 0; i < existMatmadi.tagMenu.length; i++) {
                data = await Matmadi.find({
                    tagMenu: existMatmadi.tagMenu[i],
                });
                if (data.length === 1) {
                    await Tag.findOneAndDelete({
                        tagMenu: existMatmadi.tagMenu[i],
                    });
                }
            }

            for (i = 0; i < existMatmadi.tagTasty.length; i++) {
                data = await Matmadi.find({
                    tagTasty: existMatmadi.tagTasty[i],
                });
                if (data.length === 1) {
                    await Tag.findOneAndDelete({
                        tagTasty: existMatmadi.tagTasty[i],
                    });
                }
            }

            for (i = 0; i < existMatmadi.tagPoint.length; i++) {
                data = await Matmadi.find({
                    tagPoint: existMatmadi.tagPoint[i],
                });
                if (data.length === 1) {
                    await Tag.findOneAndDelete({
                        tagPoint: existMatmadi.tagPoint[i],
                    });
                }
            }
            // 마지막으로 맛마디(리뷰) 삭제
            await Matmadi.findByIdAndDelete({ _id: madiId });

            return res
                .status(200)
                .send({ result: true, message: '리뷰 삭제 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '리뷰 삭제 실패' });
        }
    },

    // 맛마디 좋아요 토글
    likeMatmadi: async (req, res) => {
        const { userId } = res.locals.user;
        const { madiId } = req.params;
        try {
            const likeDone = await Like.findOne({ userId, madiId });
            if (likeDone) {
                return res.status(400).send({
                    result: false,
                    message: '이미 좋아요를 눌렀습니다.',
                });
            }
            await Like.create({ userId: userId, madiId: madiId });

            // 해당 게시글 좋아요 개수 다시 출력해주기 (갱신)
            const likes = await Like.find({ madiId });
            const likeNum = likes.length;
            return res
                .status(200)
                .send({ result: true, likeNum, message: '좋아요 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '좋아요 실패' });
        }
    },
    // 맛마디 좋아요 취소
    unlikeMatmadi: async (req, res) => {
        const { userId } = res.locals.user;
        const { madiId } = req.params;
        try {
            // 사용자가 좋아요를 이미 취소했는지 확인하기
            const cancleLike = await Like.findOne({ userId, madiId });
            if (!cancleLike) {
                return res.status(400).send({
                    result: false,
                    message: '이미 좋아요를 취소했습니다.',
                });
            }
            // 사용자의 좋아요 데이터  삭제
            await Like.deleteOne({ userId, madiId });
            return res
                .status(200)
                .send({ result: true, message: '좋아요 취소 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '좋아요 취소 실패',
            });
        }
    },
    // 특정 맛집의 태그 조회
    tag: async (req, res) => {
        const { storeId } = req.params;
        try {
            const tagMenu = [];
            const tagTasty = [];
            const tagPoint = [];

            const existTag = await Tag.find({ storeId });

            // existTag 배열을 3가지 태그의 배열로 분리하기!
            // 배열의 요소를 하나씩 비교해서 조건문에 해당하는 3가지 태그 배열에 Push한다.
            for (i = 0; i < existTag.length; i++) {
                if (existTag[i].tagMenu) {
                    tagMenu.push(existTag[i].tagMenu);
                } else if (existTag[i].tagTasty) {
                    tagTasty.push(existTag[i].tagTasty);
                } else if (existTag[i].tagPoint) {
                    tagPoint.push(existTag[i].tagPoint);
                }
            }

            const result = { tagMenu, tagTasty, tagPoint };
            return res
                .status(200)
                .send({ result: result, message: '맛집 태그 조회 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '맛집 태그 조회 실패',
            });
        }
    },
    // 특정 맛집의 추천 메뉴 조회
    viewMenu: async (req, res) => {
        const { storeId } = req.params;
        try {
            //
            const existTag = await Tag.find({ storeId, category: 'menu' });

            // 메뉴의 좋아요 수 찾아서 배열 생성
            const menuLikeNum = [];
            for (i = 0; i < existTag.length; i++) {
                let likes = await Like.find({ menuId: existTag[i]._id });
                menuLikeNum.push(likes.length);
            }

            // map 함수로 필요한 부분 정리해서 출력
            const result = existTag.map((a, idx) => ({
                menuId: a.id,
                menuName: a.tagMenu,
                menuLikeNum: menuLikeNum[idx],
            }));

            return res
                .status(200)
                .send({ result: result, message: '맛집 추천메뉴 조회 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '맛집 추천메뉴 조회 실패',
            });
        }
    },

    // 태그 좋아요 토글
    likeMenu: async (req, res) => {
        const { userId } = res.locals.user;
        const { menuId } = req.params;
        try {
            const likeDone = await Like.findOne({ userId, menuId });
            if (likeDone) {
                return res.status(400).send({
                    result: false,
                    message: '이미 좋아요를 눌렀습니다.',
                });
            }
            await Like.create({ userId, menuId });
            // 해당 게시글 좋아요 개수 다시 출력해주기 (갱신)
            const likes = await Like.find({ menuId });
            const likeNum = likes.length;

            return res
                .status(200)
                .send({ result: true, likeNum, message: '좋아요 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '좋아요 실패' });
        }
    },
    // 태그 좋아요 취소
    unlikeMenu: async (req, res) => {
        const { userId } = res.locals.user;
        const { menuId } = req.params;
        try {
            const cancleLike = await Like.findOne({ userId, menuId });
            if (!cancleLike) {
                return res.status(400).send({
                    result: false,
                    message: '이미 좋아요를 취소했습니다.',
                });
            }
            await Like.findOneAndDelete({ userId, menuId });
            return res
                .status(200)
                .send({ result: true, message: '좋아요 취소 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '좋아요 취소 실패',
            });
        }
    },
    // 태그 필터 검색
    tagMapViewer: async (req, res) => {
        const { lon, lat, distance } = req.query;
        const { tag } = req.body;
        try {
            //사용자의 현재위치 2km반경 내의 맛집 전체 검색
            const allStore = [];
            if (lat !== undefined && lon !== undefined && tag !== undefined) {
                for (i = 0; i < tag.length; i++) {
                    allStore.push(
                        ...(await Store.find({
                            mainTag: tag[i],
                            location: {
                                $near: {
                                    //해당하는 포인트로부터 최대 범위. 1000 = 1km, 2000 = 2km
                                    $maxDistance: 2000, //distance를 받아서 사용자가 고르게 해도 좋을듯
                                    $geometry: {
                                        type: 'Point',
                                        coordinates: [lon, lat],
                                    },
                                },
                            },
                        }))
                    );
                }
            } else if (
                lat !== undefined &&
                lon !== undefined &&
                tag === undefined
            ) {
                allStore.push(
                    ...(await Store.find({
                        location: {
                            $near: {
                                //해당하는 포인트로부터 최대 범위. 1000 = 1km, 2000 = 2km
                                $maxDistance: 2000,
                                $geometry: {
                                    type: 'Point',
                                    coordinates: [lon, lat],
                                },
                            },
                        },
                    }))
                );
            } else {
                allStore.push(...(await Store.find()));
            }

            const storeMap = [];
            for (i = 0; i < allStore.length; i++) {
                findUser = await User.findById(allStore[i].userId);
                storeMap.push({
                    storeId: allStore[i].storeId,
                    storeName: allStore[i].storeName,
                    address: allStore[i].address,
                    lon: allStore[i].location.coordinates[0],
                    lat: allStore[i].location.coordinates[1],
                    tag: allStore[i].mainTag,
                    nickname: findUser.nickname,
                    faceColor: findUser.faceColor,
                    eyes: findUser.eyes,
                });
            }
            res.status(200).send({
                result: true,
                message: '지도에 맛집 보여주기 성공',
                storeMap: storeMap,
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '지도에 맛집 보여주기 실패',
            });
        }
    },
};

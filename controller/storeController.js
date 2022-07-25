const Room = require('../models/room');
const User = require('../models/user');
const Savelist = require('../models/savelist');
const Store = require('../models/store');
const UsersRoom = require('../models/usersRoom');
const Matmadi = require('../models/matmadi');
const Like = require('../models/like');
const Tag = require('../models/tag');
const { find } = require('../models/user');

module.exports = {
    // 지도에 맛집 보여주기 (현재 위치기반 검색)
    mapViewer: async (req, res) => {
        const {LatLon} = req.query.LatLon;
        try {
            const allStore = await Store.find().exec();

            const storeMap = [];
            for (i = 0; i < allStore.length; i++) {
                findUser = await User.findById(allStore[i].userId);
                storeMap.push({
                    storeId: allStore[i].storeId,
                    storeName: allStore[i].storeName,
                    address: allStore[i].address,
                    LatLon: allStore[i].LatLon,
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
    // 맛방에 맛집 저장 - 이미 선택된 맛방도 다시 중복으로 들어옴. 에러를 내면 안되고 그냥 넘어가면됨. 이미 선택된 맛방이 선택되지 않았을때는 savelist에서 제거해야함.
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
            // roomId가 여러개 들어옴. roomId 별로 savelist에 저장
            for (let i = 0; i < selectedRooms.length; i++) {
                // 선택된 맛방이 존재하는 맛방인지 확인
                const theRoom = await Room.findById(selectedRooms[i]).exec();
                //roomId가 이미 savelistDB에 있는지 확인
                const existSavelist = await Savelist.findOne({
                    storeId,
                    roomId: selectedRooms[i],
                });
                if (!theRoom) {
                    res.status(400).send({
                        result: false,
                        message: '존재하는 맛방이 아닙니다.',
                    });
                }
                if (!existSavelist) {
                    await Savelist.create({
                        userId,
                        roomId: selectedRooms[i],
                        storeId,
                        createdAt: Date.now(),
                    });
                }
            }
            //선택된 룸ID 유저의 savelist중 스토어 아이디를 갖고있는 roomId?
            //savelist에서 선택된 roomId가 있는지 없는지 찾고. 있으면 놔두고 없으면 생성하고, 선택되지않은 애는 삭제하고.
            const findExistSavelist = await Savelist.findOneAndUpdate({
                roomId,
                userId,
            });
            for (let i = 0; i < findExistSavelist.length; i++) {
                if (!selectedRooms.includes(findExistSavelist[i].roomId)) {
                    await Savelist.findByIdAndDelete(findExistSavelist[i]); //이거 작동하는지 확인해야함. saveId로 참조해야하는거같은데.
                }
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
        const {
            storeName,
            address,
            LatLon,
            tag,
            
        } = req.body;

        try {
            const existStore = await Store.find({LatLon, storeName})
            if(existStore){
                return res.status(400).send({result : false, message : "이미 존재하는 맛집입니다."})
            }
            // 정보를 가게 DB에 저장
            const save = await Store.create({
                userId,
                storeName,
                address,
                LatLon,
                mainTag: tag,
                createdAt: Date.now(),
            });
            
            res.status(200).send({
                result: true,
                storeId: save.storeId,
                message : "맛집 기록 완료"
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
    // 사용자의 맛방 목록 조회 (내가 소속된 맛방 별로 검색) // 맛방에 등록된 맛집 수
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
                storeNum.push(allStorelist.length);
            }

            // 방 목록 배열에, 조건에 해당하는 status 키값 집어넣기
            let status = '';
            const myroom = [];
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
            }

            const result = arrTheRoom.map((room, idx) => ({
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
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 특정 맛방의 맛집 태그 아이콘
    roomTagIcon: async (req, res) => {
        const { roomId } = req.params;
        try {
            //
            const findStoreList = await Savelist.find({ roomId });
            const findRoom = await Room.findById(roomId);
            const roomName = findRoom.roomName
            // 맛방에 등록된 맛집리스트 찾기
            const findStoreInfo = []; // 맛집의 정보를 순서대로 쌓는다.
            const findUserIcon = []; // 처음 등록한 유저의 정보가 맛집 순서대로 쌓인다
            const findStarAvg = []; // 별점 평균이 맛집의 순서대로 쌓임
            for (let i = 0; i < findStoreList.length; i++) {
                //console.log(findStoreList[i].userId)
                let stores = await Store.findById(findStoreList[i].storeId);
                let users = await User.findById(findStoreList[i].userId);
                findStoreInfo.push(stores);
                findUserIcon.push(users);

                // 모든 맛마디 리뷰에 등록된 star 찾아서 평균값 출력
                const list = await Matmadi.find({
                    storeId: findStoreList[i].storeId,
                });
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
                    findStarAvg.push(0);
                }
            }
            likes = await Like.find({madiId: madiId})


            const result = findStoreList.map((a, idx) => ({
                storeId: a.storeId,
                storeName: findStoreInfo[idx].storeName,
                LatLon: findStoreInfo[idx].LatLon,
                nickname: findUserIcon[idx].nickname,
                faceColor: findUserIcon[idx].faceColor,
                eyes: findUserIcon[idx].eyes,
                starAvg: findStarAvg[idx],
                comment: '', //가장 많은 좋아요를 받은 맛마디?
            }));
            return res.status(200).send({ result: result, message: '${roomName} 맛방의 맛집 조회 완료.' });
            /*
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
                },*/
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },

    // 리뷰 남기기 (맛마디)
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
                createdAt,
            });
            // 태그 DB에 해당 태그 데이터가 있는지 확인하고 없으면 create
            // 그냥 찾고 if문으로 없으면 생성할까..
            await Tag.findOneAndUpdate(tagMenu, { upsert: true });
            return res
                .status(200)
                .send({ result: true, message: '리뷰 작성 완료!' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },

    // 맛마디 전체 조회
    allMatmadi: async (req, res) => {
        const { storeId } = req.params;
        try {
            const existMatmadi = await Matmadi.find(storeId).exec();
            //리뷰별 좋아요 갯수 찾아서 배열에 넣음.
            const likeNum = [];
            for (i = 0; i < existMatmadi.length; i++) {
                likes = await Like.find({ madiId: existMatmadi[i].madiId });
                likeNum.push(likes.length);
            }
            // map 함수로 찾은 리뷰 데이터와 좋아요 개수 출력
            const result = existMatmadi.map((a, idx) => ({
                commentId: a.madiId,
                imgURL: a.imgURL,
                comment: a.comment,
                star: a.star,
                likeNum: likeNum[idx],
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
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 맛마디 상세 조회
    detailMatmadi: async (req, res) => {
        const { madiId } = req.params;
        try {
            const existMatmadi = await Matmadi.findById(madiId);
            const author = await User.findById(existMatmadi.userId);
            const likes = await Like.find({ madiId });
            const result = {
                imgURL: existMatmadi.imgURL,
                comment: existMatmadi.comment,
                star: existMatmadi.star,
                likeNum: likes.length,
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
    // 맛마디 수정시 태그가 바뀌는데, 지운 태그가 태그DB의 마지막 태그라면 데이터를 지워야한다.
    updateMatmadi: async (req, res) => {
        const { userId } = res.locals.user;
        const { madiId } = req.params;
        try {
            const existMatmadi = await Matmadi.findById(madiId);
            if (userId !== existMatmadi.userId) {
                return res.status(400).send({
                    result: false,
                    message: '사용자 작성한 리뷰가 아닙니다.',
                });
            }
            const result = await Matmadi.findByIdAndUpdate(madiId, {
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
            });
            return res
                .status(200)
                .send({ result: result, message: '리뷰 수정 완료' });
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
            function deleteLastData(a) {
                for (i = 0; i < existMatmadi.a.length; i++) {
                    data = Matmadi.find({ a: existMatmadi.a[i] });
                    if (data.length === 1) {
                        Tag.findOneAndDelete({ a: existMatmadi.a[i] });
                    }
                }
            }
            deleteLastData(tagMenu);
            deleteLastData(tagTasty);
            deleteLastData(tagPoint);
            /*
                for(i=0; i<existMatmadi.tagMenu.length; i++){
                    data = await find({tagMenu:existMatmadi.tagMenu[i]})
                    if(data.length === 1){
                        await findOneAndDelete({tagMenu:existMatmadi.tagMenu[i]})
                    }
                }
                const result = await Matmadi.findByIdAndDelete(madiId);
                */
            return res
                .status(200)
                .send({ result: result, message: '리뷰 삭제 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '리뷰 삭제 실패' });
        }
    },

    // 맛마디 좋아요 토글
    likeMatmadi: async (req, res) => {
        const { userId } = res.locals.user;
        const { madiId } = req.body;
        try {
            const likeDone = await Like.findOne({ userId, madiId });
            if (likeDone) {
                return res.status(400).send({
                    result: false,
                    message: '이미 좋아요를 눌렀습니다.',
                });
            }
            await Like.create({ userId, madiId });

            // 해당 게시글 좋아요 개수 다시 출력해주기 (갱신)
            const likes = await Like.find({ tagId });
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
        const { madiId } = req.body;
        try {
            const cancleLike = await Like.findOneAndDelete({ userId, madiId });
            if (!cancleLike) {
                return res.status(400).send({
                    result: false,
                    message: '이미 좋아요를 취소했습니다.',
                });
            }
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
    // 특정 맛집의 맛태그 조회 //태그와 추천메뉴 같이 출력해야함. 아래 API 제거하기
    tag: async (req, res) => {
        const { storeId } = req.params;
        try {
            const existTag = await Tag.find({ storeId });
            const result = {
                tagMenu: existTag.tagMenu,
                tagTasty: existTag.tagTasty,
                tagPoint: existTag.tagPoint,
            };
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
            const existTag = await Tag.find({ storeId });
            const result = [];
            for (i = 0; i < existTag.length; i++) {
                if (existTag[i]) {
                    result.push(existTag[i].tagMenu);
                }
            }
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

    // 태그 좋아요 토글
    likeMenu: async (req, res) => {
        const { userId } = res.locals.user;
        const { tagId } = req.body;
        try {
            const likeDone = await Like.findOne({ userId, tagId });
            if (likeDone) {
                return res.status(400).send({
                    result: false,
                    message: '이미 좋아요를 눌렀습니다.',
                });
            }
            await Like.create({ userId, tagId });
            // 해당 게시글 좋아요 개수 다시 출력해주기 (갱신)
            const likes = await Like.find({ tagId });
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
        const { tagId } = req.body;
        try {
            const cancleLike = await Like.findOneAndDelete({ userId, tagId });
            if (!cancleLike) {
                return res.status(400).send({
                    result: false,
                    message: '이미 좋아요를 취소했습니다.',
                });
            }
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
        try {
            return res.status(200).send({ result: true, message: ' ' });
            console.log(err);
        } catch (err) {
            res.status(400).send({ result: false, message: ' ' });
        }
    },
};

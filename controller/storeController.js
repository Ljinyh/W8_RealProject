const Room = require('../models/room');
const User = require('../models/user');
const Savelist = require('../models/savelist');
const Store = require('../models/store');
const UsersRoom = require('../models/usersRoom');

module.exports = {
    // 지도에 맛집 보여주기 (현재 위치기반 검색)
    mapViewer: async (req, res) => {
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

    // 맛집 생성 (첫 기록하기), 방장의 맛방에 맛집 추가까지
    createStore: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const {
            storeName,
            comment,
            address,
            LatLon,
            imgURL,
            tag,
            star,
            recommendMenu,
        } = req.body;
        const { roomId } = req.params;

        try {
            // 정보를 가게 DB에 저장
            const save = await Store.create({
                userId: user.userId,
                storeName,
                address,
                imgURL,
                LatLon,
                mainTag: tag,
                createdAt: Date.now(),
            });

            // 방장이 보고있던 roomId를 가져와서 savelist에 저장
            await Savelist.create({
                userId: user.userId,
                storeId: save.storeId,
                imgURL: imgURL,
                roomId,
                comment,
                star,
                tag,
                recommendMenu,
                createdAt: Date.now(),
            });
            res.status(200).send({
                result: true,
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
            // userId, roomSeq : [kdskd,skdks,skdk]

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
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 맛마디 전체 조회
    allMatmadi: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 맛마디 상세 조회
    detailMatmadi: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 맛마디 수정
    updateMatmadi: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 맛마디 좋아요 토글
    likeMatmadi: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 맛마디 좋아요 취소
    unlikeMatmadi: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 특정 맛집의 맛태그 조회
    mattag: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 특정 맛집의 추천 메뉴 조회
    viewMenu: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 추천 메뉴 추가
    addMenu: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 추천 메뉴 좋아요 토글
    likeMenu: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 추천 메뉴 좋아요 취소
    unlikeMenu: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
    // 태그 필터 검색
    tagMapViewer: async (req, res) => {
        try {
            return res.status(200).send({ result: true, message: ' ' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: ' ' });
        }
    },
};

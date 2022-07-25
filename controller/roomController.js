const Room = require('../models/room');
const User = require('../models/user');
const Savelist = require('../models/savelist');
const Store = require('../models/store');
const UsersRoom = require('../models/usersRoom');
const Joi = require('joi');

module.exports = {
    //===================================================================================
    // 사용자 맛방 전체조회
    allRoom: async(req, res) => {
        const { userId } = res.locals.user; // JWT 인증 정보
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
            for (i = 0; i < existRoom.roomSeq.length; i++) {
                roomInfo = await Room.findById(existRoom.roomSeq[i]);
                arrTheRoom.push(roomInfo);
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
                message: '맛방 전체 조회 실패',
            });
        }
    },

    //===================================================================================
    // 사용자 검색
    findUser: async(req, res) => {
        const { value } = req.body;

        const findUser = await User.find({
            $or: [
                { customerId: new RegExp(value) },
                { nickname: new RegExp(value) },
                { name: new RegExp(value) },
                { email: new RegExp(value) },
            ],
        });

        try {
            if (findUser.length === 0) {
                return res
                    .status(400)
                    .send({ errorMessage: '회원이 없습니다!' });
            }

            if (findUser) {
                const result = [];

                for (let i = 0; i < findUser.length; i++) {
                    const userArray = {
                        userId: findUser[i].userId,
                        nickname: findUser[i].nickname,
                        name: findUser[i].name,
                        faceColor: findUser[i].faceColor,
                        eyes: findUser[i].eyes,
                    };
                    result.push(userArray);
                }
                return res.status(200).send({ msg: '회원 찾기 성공', result });
            }
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false });
        }
    },

    //===================================================================================
    //맛방 detail - 방 정보
    detailRoomInfo: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomId } = req.params;

        const findRoom = await Room.findById(roomId);
        console.log(findRoom.guestId);
        try {
            if (findRoom) {
                const ownerCheck = findRoom.ownerId === userId;
                const guestCheck = findRoom.guestId.includes(userId);
                const guestNumCheck = findRoom.guestId.length;

                let status = '';
                if (ownerCheck && guestNumCheck === 0) {
                    status = 'private';
                } else if (!ownerCheck && guestCheck) {
                    status = 'publicGuest';
                } else if (ownerCheck && !guestCheck) {
                    status = 'publicOwner';
                }

                const result = {
                    roomName: findRoom.roomName,
                    roomCode: findRoom.roomCode,
                    emoji: findRoom.emoji,
                    status: status,
                };
                return res
                    .status(200)
                    .send({ msg: '방정보 불러오기 성공', result });
            }
            return res.status(400).send({ errorMessage: '불러오기 실패!' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false });
        }
    },

    //===================================================================================
    //맛방 detail - 멤버 리스트
    detailRoomMember: async(req, res) => {
        const { roomId } = req.params;
        const { userId } = res.locals.user;

        try {
            const Guests = await Room.findById(roomId);

            if (!Guests) {
                return res
                    .status(400)
                    .send({ errorMessage: '방이 존재하지 않습니다' });
            }
            const ownerId = Guests.ownerId;
            const guestId = Guests.guestId;

            if (ownerId === userId || guestId.includes(userId)) {
                const ownerInfo = await User.findById(ownerId);

                let guestInfo = [];
                for (let i = 0; i < guestId.length; i++) {
                    const users = await User.findById(guestId[i]).exec();

                    guestInfo.push({
                        userId: users.userId,
                        nickname: users.nickname,
                        faceColor: users.faceColor,
                        eyes: users.eyes,
                    });
                }

                const userInfo = {
                    owner: {
                        ownerId: ownerId,
                        nickname: ownerInfo.nickname,
                        faceColor: ownerInfo.faceColor,
                        eyes: ownerInfo.eyes,
                    },
                    guestInfo,
                    memberCount: guestId.length + 1,
                };

                return res.status(200).send({
                    msg: '멤버 리스트 가져오기 성공',
                    userInfo,
                });
            }
            res.status(400).send({
                errorMessage: '회원님이 포함되어있지 않은 방입니다.',
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false });
        }
    },

    //===================================================================================
    // 맛방 detail - 맛집 리스트
    detailRoomStoreList: async(req, res) => {
        const { roomId } = req.params;

        const existRoom = await Room.findById(roomId)
            .sort({ createdAt: 'asc' })
            .exec();

        try {
            if (existRoom) {
                const result = [];
                const theStores = [];
                //맛방에 등록된 정보 찾기
                const theStore = await Savelist.find({ roomId: roomId });
                //밋빙에 등록된 맛집의 수
                const total = theStore.length;
                // 맛집 id 빼오기
                const storeId = theStore.map((e) => e.storeId);

                // 맛집 정보가져오기 및 response 값 정리
                for (let i = 0; i < storeId.length; i++) {
                    const storeInfo = await Store.findById(storeId[i]).exec();
                    theStores.push(storeInfo);

                    const theStoreList = {
                        storeName: theStores[i].storeName,
                        comment: theStore[i].comment,
                        imgURL: theStore[i].imgURL,
                        tag: theStore[i].tag,
                        address: theStores[i].address,
                        LatLon: theStores[i].LatLon,
                    };
                    result.push(theStoreList);
                }

                return res.status(200).send({
                    msg: '맛집리스트 가져오기 성공',
                    total: total,
                    result,
                });
            }

            res.status(400).send({ errorMessage: '맛집리스트 가져오기 실패' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false });
        }
    },

    //===================================================================================
    //맛방 만들기
    // roomName은 8글자, 방 초대인원 20명으로 제한 (게스트 19명)
    writeRoom: async(req, res) => {
        const roomNameCheck = Joi.object({
            roomName: Joi.string().required().max(8).messages({
                'string.empty': '{{#label}}를 채워주세요.',
                'string.max': '{{#label}}는 최대 8글자입니다.',
            }),
        }).unknown();

        const { user } = res.locals;

        try {
            const { roomName, guestId, emoji } =
            await roomNameCheck.validateAsync(req.body);

            const roomCode = Math.random().toString().substring(2, 8);

            if (roomName === undefined) {
                return res.status(400).send({
                    result: false,
                    message: '방 이름을 입력하세요.',
                });
            }
            // guestId 배열 안에 사용자가 있는지 확인
            if (guestId.some((v) => v === user.userId)) {
                return res.status(400).send({
                    result: false,
                    message: '멤버로 나 자신을 추가할 수 없습니다.',
                });
            }
            if (guestId.length > 19) {
                //맛방 멤버 총 인원 20명으로 제한
                return res.status(400).send({
                    result: false,
                    message: '맛방의 최대 인원은 20명입니다.',
                });
            }
            // 맛방 DB에 방 생성
            const createdRoom = await Room.create({
                roomName,
                ownerId: user.userId,
                guestId,
                emoji,
                roomCode,
            });

            // 방장의 UsersRoom DB에 userId에 해당하는 목록 수정, 없으면 생성
            await UsersRoom.findOneAndUpdate({ userId: user.userId }, { $push: { roomSeq: createdRoom.roomId } }, { upsert: true });

            // 게스트들의 UsersRoom DB에 userId에 해당하는 목록 수정, 없으면 생성
            if (!!guestId) {
                for (i = 0; i < guestId.length; i++) {
                    await UsersRoom.findOneAndUpdate({ userId: guestId[i] }, { $push: { roomSeq: createdRoom.roomId } }, { upsert: true });
                }
            }
            return res
                .status(200)
                .json({ result: true, message: '맛방 만들기 성공' });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '맛방 만들기 실패',
            });
        }
    },

    //===================================================================================
    // 맛방 초대 (공유하기)
    inviteRoom: async(req, res) => {
        const { userId } = res.locals.user;
        const { guestId } = req.body;
        const { roomId } = req.params;

        try {
            const theRoom = await Room.findById(roomId);
            const existUser = theRoom.guestId;
            
            if (existUser.length > 20) {
                return res
                    .status(400)
                    .send({ errorMessage: '초대인원이 꽉 찼습니다.' });
            }

            if (guestId.includes(userId)) {
                return res
                    .status(400)
                    .send({ errorMessage: '자기 자신은 초대할 수 없습니다!' });
            }

            // 초대된 사람 제외
            const inviteGuest = await guestId.filter((e) => !existUser.includes(e));

            if(inviteGuest.length === 0 || inviteGuest.includes(theRoom.ownerId)) {
                return res.status(400).send({ errorMessage: "이미 초대되었습니다"})
            }

            for (let i = 0; i < inviteGuest.length; i++) {              
                if (theRoom) {
                    await theRoom.updateOne({
                        $push: {
                            guestId: inviteGuest,
                        },
                    });

                    await UsersRoom.findOneAndUpdate({ userId: inviteGuest[i] }, {
                        $push: { roomSeq: roomId },
                    }, { upsert: true });
                }}
                    return res.status(200).send({ msg: `초대성공!` });
                

            res.status(400).send({
                errorMessage: '회원정보가 없거나 방이 없습니다!',
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false });
        }
    },

    //===================================================================================
    // 맛방에서 게스트 강퇴
    kickRoom: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomId } = req.params;
        const { guestId } = req.body;

        const existRoom = await Room.findById(roomId).exec();

        try {
            if (existRoom.guestId.length === 0) {
                return res
                    .status(400)
                    .send({ errorMessage: '방에 guest가 존재하지 않습니다' });
            }

            if (existRoom && existRoom.ownerId === userId) {
                await UsersRoom.findOneAndUpdate({ userId: guestId }, {
                    $pull: { roomSeq: roomId },
                });

                await existRoom.updateOne({ $pull: { guestId: guestId } });
                return res.status(200).send({ result: 'success' });
            }
            res.status(400).send({ errorMessage: '강퇴 실패!' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false });
        }
    },

    //===================================================================================
    // 맛방 정보 수정
    rewriteRoom: async(req, res) => {
        const roomNameCheck = Joi.object({
            roomName: Joi.string().required().max(8).messages({
                'string.empty': '{{#label}}를 채워주세요.',
                'string.max': '{{#label}}는 최대 8글자입니다.',
            }),
        }).unknown();

        const { user } = res.locals;
        const { roomId } = req.params;
        try {
            const { roomName, emoji } = await roomNameCheck.validateAsync(
                req.body
            );

            // 맛방 DB에서 roodId에 해당하는 방 찾기
            const existRoom = await Room.findById(roomId).exec();

            if (!existRoom) {
                return res.status(400).send({
                    errorMessage: '맛방이 존재하지 않습니다.',
                });
            }

            // 방장이 아니면 실행 불가
            if (user.userId !== existRoom.ownerId) {
                return res.status(400).send({
                    errorMessage: '방장이 아니면 수정이 불가능합니다.',
                });
            }
            // DB에서 정보 수정 (방 제목, emoji)
            await Room.findByIdAndUpdate(roomId, { $set: { roomName, emoji } });
            res.status(200).json({
                result: true,
                message: '맛방 정보 수정 완료',
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                errorMessage: '맛방 수정 실패',
            });
        }
    },

    //==============================================================
    //맛방 삭제
    deleteRoom: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomId } = req.params;

        try {
            const existRoom = await Room.findById(roomId);

            if (!existRoom) {
                return res
                    .status(400)
                    .send({ errorMessage: '맛방이 존재하지 않습니다!' });
            }

            if (existRoom.ownerId !== userId) {
                return res.status(400).send({
                    errorMessage: '사용자가 만든 맛방이 아닙니다!',
                });
            }

            // 방이 삭제되면 추가된 맛집리스트들도 같이 삭제
            const findRoom = await Savelist.find({ roomId: roomId });

            if (findRoom) {
                for (let i = 0; i < findRoom.length; i++) {
                    await Savelist.deleteOne(findRoom[i]);
                }
            }

            // 게스트 멤버들의 맛방목록 DB에서 맛방 삭제해주기.
            for (let i = 0; i < existRoom.guestId.length; i++) {
                await UsersRoom.findOneAndUpdate({ userId: existRoom.guestId[i] }, {
                    $pull: { roomSeq: roomId },
                });
            }

            // 방장의 맛방목록 DB에서 맛방 삭제
            await UsersRoom.findOneAndUpdate({ userId: userId }, {
                $pull: { roomSeq: roomId },
            });

            // 맛방 삭제
            await Room.findByIdAndDelete(roomId);
            res.status(200).json({ result: true });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '맛방 삭제 실패' });
        }
    },

    //==============================================================
    // 맛방 나가기
    exitRoom: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomId } = req.params;

        const existRoom = await Room.findById(roomId).exec();

        try {
            if (existRoom.ownerId === userId) {
                return res
                    .status(400)
                    .send({ errorMessage: '방장은 나갈 수 없습니다.' });
            }

            if (
                existRoom &&
                existRoom.ownerId !== userId &&
                existRoom.guestId.includes(userId)
            ) {
                await Room.findByIdAndUpdate(roomId, {
                    $pull: { guestId: userId },
                });

                await UsersRoom.findOneAndUpdate({ userId: userId }, {
                    $pull: { roomSeq: roomId },
                });

                return res.status(200).send({ msg: '맛방 나가기 성공' });
            }
            res.status(400).send({ errorMessage: '맛방 나가기 실패' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false });
        }
    },

    //==============================================================
    //맛방 순서 변경
    setSequenceRoom: async(req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomSeq } = req.body;
        try {
            const existRoom = await UsersRoom.findOne({
                userId: user.userId,
            }).exec();
            if (!existRoom) {
                return res.status(400).send({
                    result: false,
                    errorMessage: '사용자의 방이 존재하지 않습니다',
                });
            }
            if (existRoom.roomSeq.length !== roomSeq.length) {
                return res.status(400).send({
                    result: false,
                    errorMessage: '변경된 방과 처음 방의 배열 갯수가 같지 않습니다',
                });
            }
            if (Array.isArray(roomSeq) && roomSeq.length === 0) {
                return res.status(400).send({
                    result: false,
                    errorMessage: 'roomSeq 입력 오류 (빈 배열)',
                });
            }

            await UsersRoom.findOneAndUpdate({ userId: user.userId }, { $set: { roomSeq: roomSeq } });
            res.status(200).send({ result: true, message: '순서 변경 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                errMessage: '순서 변경 실패',
            });
        }
    },

    //==============================================================
    // 맛방에 맛집 저장
    saveStore: async(req, res) => {
        const { roomId } = req.params;
        const { userId } = res.locals.user;
        const { storeId, comment, tag, imgURL, price, star } = req.body;

        const theRoom = await Room.findById(roomId).exec();
        const theStore = await Store.findById(storeId).exec();
        const existSavelist = await Savelist.findOne({storeId, roomId})
        try {
            if (existSavelist){
                return res.status(400).send({ errorMessage: '이미 맛방에 저장되어 있는 맛집입니다.' });
            }
            if (theRoom && theStore) {
                Savelist.create({
                    userId,
                    roomId,
                    storeId: theStore.storeId,
                    comment,
                    star,
                    price,
                    tag,
                    imgURL,
                    createdAt: Date.now(),
                });

                return res.status(200).send({ msg: '성공!' });
            }

            res.status(400).send({ errorMessage: '실패' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false });
        }
    },

    //==============================================================
    // 룸코드 생성 코드
    findRoomCode: async(req, res) => {
        const { roomId } = req.params;

        const findRoom = await Room.findById(roomId).exec();
        try {
            if (findRoom) {
                return res.status(200).send({ roomCode: findRoom.roomCode });
            }
            res.status(400).send({ errorMessage: '룸코드를 찾지 못했습니다!' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, err });
        }
    },
    //==============================================================
    //룸코드로 검색
    searchRoomCode: async(req, res) => {
        const { roomCode } = req.body;

        const findRoom = await Room.findOne({ roomCode: roomCode });

        try {
            // 룸코드 검증
            if (findRoom) {
                // 방주인 정보 찾기
                const ownerInfo = await User.findById(findRoom.ownerId);
                const ownerNickname = ownerInfo.nickname;

                const theRoom = {
                    roomName: findRoom.roomName,
                    emoji: findRoom.emoji,
                    owner: ownerNickname,
                    ownerFaceColor: ownerInfo.faceColor,
                    ownerEyes: ownerInfo.eyes,
                    memberNum: findRoom.guestId.length + 1,
                };
                return res.status(200).send({ result: 'success', theRoom });
            } else {
                return res
                    .status(400)
                    .send({ errorMessage: '방이 존재하지 않습니다!' });
            }
        } catch (err) {
            console.log(err);
            res.status(400).send({ errorMessage: 'error' });
        }
    },

    //==============================================================
    //룸코드로 맛방입장
    roomCode: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomCode } = req.body;

        const findRoom = await Room.findOne({ roomCode: roomCode });
        try {
            // 룸코드 검증
            if (findRoom) {
                if (findRoom.guestId.includes(userId)) {
                    return res
                        .status(400)
                        .send({ errorMessage: '이미 방에 들어가 있습니다.' });
                }

                // 유저가 guest에 없다면 방 입장
                await Room.findByIdAndUpdate({ _id: findRoom.roomId }, {
                    $push: { guestId: userId },
                });

                await UsersRoom.findOneAndUpdate({ userId: userId }, {
                    $push: { roomSeq: findRoom.roomId },
                }, { upsert: true });
                return res.status(200).send({ result: 'success' });
            } else {
                return res
                    .status(400)
                    .send({ erroMessage: '방이 존재하지 않습니다!' });
            }
        } catch (err) {
            console.log(err);
            res.status(400).send({ errorMessage: 'error' });
        }
    },
};
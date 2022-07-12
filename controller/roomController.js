const Room = require('../models/room');
const User = require('../models/user');
const Store = require('../models/store');
const SaveList = require('../models/saveList');
const UserRoom = require('../models/userRoom');

module.exports = {
    //==============================================================
    // 사용자 맛방 전체조회
    allRoom: async(req, res) => {
        const { userId } = res.locals.user;

        let status = '';
        // 유저가 들어가있는 모든 방을 불러오기
        const searchRoom = await Room.find({
                $or: [{ ownerId: userId }, { guestId: userId }],
            })
            .sort({ createdAt: 'asc' })
            .exec();

        try {
            if (!searchRoom) {
                return res
                    .status(400)
                    .send({ errorMessage: '방이 존재하지 않습니다!' });
            }

            //userRoom 데이터 테이블에서 찾기
            const existRoom = await UserRoom.findOne({ userId: userId }).exec();

            if (!existRoom) {
                return res.status(400).send({
                    errorMessage: 'usersRoom에 해당 데이터가 없습니다!',
                });
            }

            const rooms = existRoom.roomSeq;
            const total = rooms.length;

            //저장된 방 정보 불러오기
            const arrTheRoom = [];

            for (let i = 0; i < total; i++) {
                const findRoom = await Room.findById(rooms[i]).exec();
                arrTheRoom.push(findRoom);
            }

            //status값 지정하기
            let myroom = [];

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

            //response 값 가공하기
            const result = arrTheRoom.map((room, idx) => ({
                roomId: room.roomId,
                roomCode: room.roomCode,
                roomName: room.roomName,
                emoji: room.emoji,
                ownerId: room.ownerId,
                guestId: room.guestId,
                status: myroom[idx],
                memberNum: room.guestId.length + 1,
            }));

            return res.status(200).send({ result: true, total: total, result });
        } catch (err) {
            console.log(err);
            res.send({ result: 'error' });
        }
    },

    //==============================================================
    //사용자 검색
    findUser: async(req, res) => {
        const { value } = req.body;
        const findUser = await User.findOne({
            $or: [{ nickname: value }, { name: value }, { email: value }],
        }).exec();

        if (findUser) {
            const result = {
                userId: findUser.userId,
                nickname: findUser.nickname,
                name: findUser.name,
                faceColor: findUser.faceColor,
                eyes: findUser.eyes,
            };
            return res.status(200).send({ msg: '회원 찾기 성공', result });
        }
        res.status(400).send({ errorMessage: '회원이 없습니다!' });
    },

    //==============================================================
    //맛방 detail - 방 정보
    detailRoomInfo: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomId } = req.params;

        const findRoom = await Room.findById(roomId);

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
            res.send({ result: false });
        }
    },

    //==============================================================
    //맛방 detail - 멤버 리스트
    detailRoomMember: async(req, res) => {
        const { roomId } = req.params;
        const { userId } = res.locals.user;

        const Guests = await Room.findById(roomId);

        try {
            if (Guests) {
                const ownerId = Guests.ownerId;
                const guestId = Guests.guestId;

                if (ownerId === nickname || guestId.includes(userId)) {
                    const ownerInfo = await User.findOne({ ownerId: ownerId });

                    let guestInfo = [];
                    for (let i = 0; i < guestId.length; i++) {
                        const users = await User.findOne({
                            userId: guestId[i],
                        }).exec();

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
            }
        } catch (err) {
            console.log(err);
            res.send({ result: false, msg: '서버측에 문의하세요' });
        }
    },

    //==============================================================
    //맛방에 맛집 저장[POST]
    detailRoomSave: async(req, res) => {
        const { roomId } = req.params;
        const { userId } = res.locals.user;
        const { storeId, comment, tag, imgURL, price, star } = req.body;

        const theRoom = await Room.findById(roomId).exec();
        const theStore = await Store.findById(storeId).exec();

        try {
            if (theRoom && theStore) {
                const result = SaveList.create({
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
            res.send({ result: false });
        }
    },

    //==============================================================
    //맛방 detail - 맛집 리스트[GET]
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
                const theStore = await SaveList.find({ roomId: roomId });
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
            res.send({ result: false });
        }
    },

    //==============================================================
    //맛방 만들기[POST]
    writeRoom: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomName, emoji, guestId } = req.body;
        const roomCode = Math.random().toString().substring(2, 8);

        try {
            if (guestId.length < 20) {
                if (userId) {
                    const createdAt = Date.now();
                    const result = await Room.create({
                        roomCode,
                        ownerId: userId,
                        roomName,
                        emoji,
                        guestId,
                        createdAt,
                    });

                    //user
                    await UserRoom.findOneAndUpdate({ userId: userId }, {
                        $push: { roomSeq: result.roomId },
                    }, { upsert: true });

                    //guest
                    if (result.guestId.length !== 0) {
                        for (let i = 0; i < result.guestId.length; i++) {
                            await UserRoom.findOneAndUpdate({ userId: result.guestId[i] }, {
                                $push: { roomSeq: result.roomId },
                            }, { upsert: true });
                        }
                    }
                    return res
                        .status(200)
                        .send({ msg: '맛방만들기 성공!', result });
                }
            } else {
                return res
                    .status(400)
                    .send({ errorMessage: '인원이 꽉 찼습니다!' });
            }
            res.status(400).send({ errorMessage: '맛방만들기 실패' });
        } catch (err) {
            console.log(err);
            res.send({ result: 'error' });
        }
    },

    //==============================================================
    //맛방 초대 (공유하기)
    inviteRoom: async(req, res) => {
        const { guestId } = req.body;
        const { roomId } = req.params;

        try {
            const theRoom = await Room.findById(roomId);
            const inviteUser = await User.find({
                $or: [{ userId: guestId }],
            });

            //공유코드로 입장시..?
            if (guestId.length > 20) {
                return res
                    .status(400)
                    .send({ errorMessage: '초대인원이 꽉 찼습니다.' });
            }

            for (let i = 0; i < guestId.length; i++) {
                if (
                    theRoom &&
                    inviteUser &&
                    theRoom.ownerId !== guestId[i] &&
                    !theRoom.guestId.includes(guestId[i])
                ) {
                    await theRoom.updateOne({
                        $push: {
                            guestId: guestId,
                        },
                    });
                    return res.status(200).send({ msg: `초대성공!` });
                }
            }

            res.status(400).send({
                errorMessage: '이미 초대된 사람이거나 회원정보가 없거나 방이 없습니다!',
            });
        } catch (err) {
            console.log(err);
            res.send({ result: false });
        }
    },

    //==============================================================
    //맛방 수정
    rewriteRoom: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomId } = req.params;
        const { roomName, emoji } = req.body;

        try {
            const room = await Room.findById(roomId);
            if (room && room.ownerId === userId) {
                await Room.findByIdAndUpdate(roomId, {
                    $set: {
                        roomName: roomName,
                        emoji: emoji,
                    },
                });
                return res.status(200).send({ result: '맛방 수정하기 성공!' });
            }
            res.status(400).send({
                errorMessage: '맛방 수정하기 실패! 방장이 아니거나 방이 없습니다.',
            });
        } catch (error) {
            console.log(error);
            res.send({ result: 'error' });
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
            const findRoom = await SaveList.find({ roomId: roomId });

            if (findRoom) {
                for (let i = 0; i < findRoom.length; i++) {
                    await SaveList.deleteOne(findRoom[i]);
                }
            }

            // user의 usersRoom에서도 삭제
            await UserRoom.findOneAndUpdate({ userId: userId }, {
                $pull: { roomSeq: roomId },
            });

            //guestId와 동일한 userRoom 테이블의 roomId도 삭제
            for (let i = 0; i < existRoom.guestId.length; i++) {
                await UserRoom.findOneAndUpdate({ userId: existRoom.guestId[i] }, {
                    $pull: { roomSeq: roomId },
                });
            }

            //맛방 삭제
            await Room.findByIdAndDelete(existRoom);

            res.status(200).send({ msg: '맛방 삭제하기 성공!' });
        } catch (error) {
            console.log(error);
            res.send({ result: 'error' });
        }
    },

    //==============================================================
    //맛방 순서 변경
    setSequenceRoom: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomId } = req.body;

        const existRoom = await UserRoom.findOne({ userId: userId }).exec();

        try {
            if (existRoom) {
                await existRoom.updateOne({ $set: { roomId: roomId } });
                return res.status(200).send({ result: 'success' });
            }

            res.status(400).send({ errorMessage: '맛방 순서 변경 실패!' });
        } catch (err) {
            console.log(err);
            res.send({ result: false });
        }
    },

    //==============================================================
    //맛방 강퇴기능
    kickUser: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomId } = req.params;
        const { guestId } = req.body;

        const existRoom = await Room.findById(roomId).exec();
        console.log(existRoom);
        try {
            if (existRoom && existRoom.ownerId === userId) {
                await UserRoom.findOneAndUpdate({ userId: guestId }, {
                    $pull: { roomSeq: roomId },
                });

                await existRoom.updateOne({ $pull: { guestId: guestId } });

                return res.status(200).send({ result: 'success' });
            }
            res.status(400).send({ errorMessage: '강퇴 실패!' });
        } catch (err) {
            console.log(err);
            res.send({ result: false });
        }
    },
};
const Room = require('../models/room');
const User = require('../models/user');
const Savelist = require('../models/savelist');
const Store = require('../models/store');
const UsersRoom = require('../models/UsersRoom');
const { exist } = require('joi');

module.exports = {
    //===================================================================================
    // 사용자 맛방 전체조회
    allRoom: async(req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        try {
            //현재 유저의 userId 변수 선언
            const currentUser = user.userId;

            // 사용자의 맛방 목록 DB 전체 가져오기
            const usersRoomList = await UsersRoom.findOne({
                userId: user.userId,
            });
            const Sequence = usersRoomList.roomSeq; //맛방의 순서 배열만 변수 선언

            let rooms = [];
            for (let i = 0; i < Sequence.length; i++) {
                //반복문으로 순서대로 roomId 데이터 찾기
                seqRoom = await Room.findById(Sequence[i]);

                //내가 방 주인이고, 게스트 인원이 있음 === 방장인 공개방 'publicOwner'
                if (seqRoom.guestId.length && seqRoom.ownerId === currentUser) {
                    rooms.push({
                        roomId: seqRoom._id,
                        ownerId: seqRoom.ownerId,
                        guestId: seqRoom.guestId,
                        roomName: seqRoom.roomName,
                        emoji: seqRoom.emoji,
                        memberNum: String(seqRoom.guestId.length + 1),
                        status: 'publicOwner',
                    });
                } else if (
                    // 내가 방 주인이 아니고 게스트 인원이 있음 === 게스트로 참여한 공개방 'publicGuest'
                    seqRoom.guestId.includes(currentUser) &&
                    seqRoom.ownerId !== currentUser
                ) {
                    rooms.push({
                        roomId: seqRoom._id,
                        ownerId: seqRoom.ownerId,
                        guestId: seqRoom.guestId,
                        roomName: seqRoom.roomName,
                        emoji: seqRoom.emoji,
                        memberNum: String(seqRoom.guestId.length + 1),
                        status: 'publicGuest',
                    });
                } else {
                    // 내가 방 주인이고 게스트가 없음 === 비밀방 'private'
                    rooms.push({
                        roomId: seqRoom._id,
                        ownerId: seqRoom.ownerId,
                        guestId: seqRoom.guestId,
                        roomName: seqRoom.roomName,
                        emoji: seqRoom.emoji,
                        memberNum: String(seqRoom.guestId.length + 1),
                        status: 'private',
                    });
                }
            }

            res.status(200).send({
                result: true,
                total: rooms.length,
                myRooms: rooms,
            });
        } catch (err) {
            console.log(err);
            res.send({ result: false, message: '맛방 전체 조회 실패' });
        }
    },

    //===================================================================================
    // 사용자 검색
    findUser: async(req, res) => {
        const { value } = req.body;

        const findUser = await User.findOne({
            $or: [{ nickname: value }, { name: value }, { email: value }],
        }).exec();

        try {
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
        } catch (err) {
            console.log(err);
            res.send({ result: false });
        }
    },

    //===================================================================================
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
            res.send({ result: false });
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

    //===================================================================================
    //맛방 만들기
    // roomName은 8글자, 방 초대인원 20명으로 제한 (게스트 19명)
    writeRoom: async(req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomName, guestId, emoji } = req.body;
        try {
            const roomCode = Math.random().toString().substring(2, 8);

            const createdRoom = await Room.create({
                roomName,
                ownerId: user.userId,
                guestId,
                emoji,
                roomCode,
            });

            if (createdRoom.guestId.length > 19) {
                //맛방 멤버 총 인원 20명으로 제한
                return res.status(400).send({
                    result: false,
                    message: '맛방의 최대 인원은 20명입니다.',
                });
            }
            //UsersRoom DB에 userId에 해당하는 목록 수정, 없으면 생성
            await UsersRoom.findOneAndUpdate({ userId: user.userId }, { $push: { roomSeq: createdRoom.roomId } }, { upsert: true });

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
    // roomCode를 활용하려면 맛방 입장하기 API도 별도로 필요함. (roomId 일치 && roomCode 일치)
    inviteRoom: async(req, res) => {
        const { guestId } = req.body;
        const { roomId } = req.params;

        try {
            const theRoom = await Room.findById(roomId);
            const inviteUser = await User.find({
                $or: [{ userId: guestId }],
            });

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
            res.send({ result: false });
        }
    },

    //===================================================================================
    // 맛방 정보 수정
    rewriteRoom: async(req, res) => {
        const { user } = res.locals;
        const { roomId } = req.params;
        const { roomName, emoji } = req.body;
        try {
            // 맛방 DB에서 roodId에 해당하는 방 찾기
            const existRoom = await Room.findById(roomId).exec();

            if (!existRoom) {
                return res.status(400).send({
                    errorMessage: '맛방이 존재하지 않습니다.',
                });
            }

            // 방장이 아니면 실행 불가
            if (user.userId !== existRoom.ownerId) {
                res.status(400).send({
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
        const { user } = res.locals;
        const { roomId } = req.params;

        try {
            const existRoom = await Room.findById(roomId);

            if (!existRoom) {
                return res
                    .status(400)
                    .send({ errorMessage: '맛방이 존재하지 않습니다!' });
            }
            // 맛집 리스트 삭제
            await Savelist.findOneAndDelete({ roomId: roomId });

            // 게스트 멤버들의 맛방목록 DB에서 맛방 삭제해주기.
            for (let i = 0; i < existRoom.guestId.length; i++) {
                await UsersRoom.findOneAndUpdate({ userId: existRoom.guestId[i] }, {
                    $pull: { roomSeq: roomId },
                });
            }

            // 방장의 맛방목록 DB에서 맛방 삭제
            await UsersRoom.findOneAndUpdate({ userId: user.userId }, {
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
    //맛방 순서 변경
    setSequenceRoom: async(req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomSeq } = req.body;
        try {
            const existRoom = await UsersRoom.findOne({
                userId: user.userId,
            }).exec();

            await UsersRoom.findOneAndUpdate({ userId: user.userId }, { $set: { roomSeq: roomSeq } });
            res.status(200).send({ result: true });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '순서 변경 실패' });
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

        try {
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
            res.send({ result: false });
        }
    },
};
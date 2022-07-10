const Room = require('../models/room');
const User = require('../models/user');
const Savelist = require('../models/savelist');
const Store = require('../models/store');

module.exports = {
    // 사용자 맛방 전체조회
    allRoom: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        try {
            //현재 유저의 userId 변수 선언
            const currentUser = user.userId;

            // Room에 userId가 같은 테이블 찾기
            const ownerRoom = await Room.find({
                $or: [{ ownerId: currentUser }, { guestId: currentUser }],
            });

            let rooms = []; //빈 배열 선언
            for (i = 0; i < ownerRoom.length; i++) {
                // 내가 방 주인이고 게스트 인원이 있음 === 내가 주인인 공개 방
                if (
                    ownerRoom[i].guestId.length &&
                    ownerRoom[i].ownerId === currentUser
                ) {
                    rooms.push({
                        roomId: ownerRoom[i]._id,
                        ownerId: ownerRoom[i].ownerId,
                        guestId: ownerRoom[i].guestId,
                        roomName: ownerRoom[i].roomName,
                        emoji: ownerRoom[i].emoji,
                        memberNum: String(ownerRoom[i].guestId.length + 1),
                        status: 'publicOwner',
                    });
                } else if (
                    // 내가 방 주인이 아니고 게스트 인원이 있음 === 게스트로 참여한 공개방
                    ownerRoom[i].guestId.includes(currentUser) &&
                    ownerRoom[i].ownerId !== currentUser
                ) {
                    rooms.push({
                        roomId: ownerRoom[i]._id,
                        ownerId: ownerRoom[i].ownerId,
                        guestId: ownerRoom[i].guestId,
                        roomName: ownerRoom[i].roomName,
                        emoji: ownerRoom[i].emoji,
                        memberNum: String(ownerRoom[i].guestId.length + 1),
                        status: 'publicGuest',
                    });
                } else {
                    // 내가 방 주인이고 게스트가 없음 === 비밀방
                    rooms.push({
                        roomId: ownerRoom[i]._id,
                        ownerId: ownerRoom[i].ownerId,
                        guestId: ownerRoom[i].guestId,
                        roomName: ownerRoom[i].roomName,
                        emoji: ownerRoom[i].emoji,
                        memberNum: String(ownerRoom[i].guestId.length + 1),
                        status: 'private',
                    });
                }
            }

            res.status(200).send({
                result: true,
                myRooms: rooms,
            });
        } catch (err) {
            console.log(err);
            res.send({ result: false, message: '맛방 전체 조회 실패' });
        }
    },

    // 사용자 검색 진희님꺼로!
    // guestId : { userid, userId, userId}
    findUser: async (req, res) => {
        const { text } = req.body;

        try {
            const findUser = await User.findOne({
                $or: [{ nickname: text }, { name: text }, { email: text }],
            });
            console.log(findUser);

            return res.status(200).send({
                message: '회원 찾기 성공',
                result: {
                    userId: findUser.userId,
                    nickname: findUser.nickname,
                    name: findUser.name,
                    faceColor: findUser.faceColor,
                    eyes: findUser.eyes,
                },
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '존재하지 않는 회원입니다.',
            });
        }
    },

    //맛방 detail - 방 정보. 김상선!
    detailRoomInfo: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        try {
            const existRoom = await Room.findOne({ _id: roomId }).exec();

            let room = '';
            if (existRoom.ownerId === user.userId && existRoom.guestId.length) {
                room = {
                    status: 'publicOwner',
                };
            } else if (
                existRoom.ownerId !== user.userId &&
                existRoom.guestId.length
            ) {
                room = {
                    status: 'publicGuest',
                };
            } else {
                room = {
                    status: 'private',
                };
            }
            res.status(200).send({
                result: true,
                roomId: existRoom.roomId,
                roomCode: existRoom.roomCode,
                roomName: existRoom.roomName,
                emoji: existRoom.emoji,
                status: room.status,
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '방 정보 조회 실패',
            });
        }
    },

    //맛방 detail - 멤버 리스트
    // 사용자의 닉네임은 "나"라고 표현해야하는지 결정하기
    detailRoomMember: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        try {
            const existRoom = await Room.findById(roomId).exec();

            //roomId에 해당하는 ownerId의 유저 정보
            const owner = await User.findById(existRoom.ownerId);

            //roomId에 해당하는 guestId
            const guestList = [];
            // 반복문으로 guestId에 해당하는 UserDB 조회. 배열에 필요한 필드를 집어넣음
            for (let i = 0; i < existRoom.guestId.length; i++) {
                home = await User.findById(existRoom.guestId[i]).exec();
                guestList.push({
                    userId: home.userId,
                    nickname: home.nickname,
                    faceColor: home.faceColor,
                    eyes: home.eyes,
                });
            }

            res.status(200).send({
                result: true,
                OwnerFace: {
                    userId: owner.userId,
                    nickname: owner.nickname,
                    faceColor: owner.faceColor,
                    eyes: owner.eyes,
                },
                GuestFace: guestList,
                memberCount: String(guestList.length + 1),
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '멤버 리스트 조회 실패',
            });
        }
    },

    // 맛방 detail - 맛집 리스트
    // 맛집은 다른 방에서도 조회 가능하기 때문에 특정 맛방에 종속된 테이블이 아님. 맛집 저장 리스트 테이블만 저장됨.
    // DB 구조를 분리 (room 과 savelist)했는데 합쳐서 배열로 처리해도 될 것 같다.
    detailRoomStoreList: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        try {
            const existList = await Savelist.find({ _id: roomId }).exec(); //roomId가 같은 리스트 목록 찾기
            // for문으로 Store 테이블에서 필요한 정보 뽑아오기
            for (i = 0; i < existList.length; i++) {
                findStore = await Store.findOne({ id: existList[i].storeId });
            }
            res.status(200).json({ result: true });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '맛집 리스트 조회 실패',
            });
        }
    },

    //맛방 만들기
    writeRoom: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomName, guestId, emoji } = req.body;
        try {
            const roomCode = Math.random().toString().substring(2, 8);
            await Room.create({
                createdAt: Date.now(),
                roomName,
                ownerId: user.userId,
                guestId,
                emoji,
                roomCode,
            });
            res.status(200).json({ result: true });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '맛방 만들기 실패',
            });
        }
    },

    // 맛방 초대 (공유하기)
    // 사용자 추가가 되어버렸다...roomCode는 어쩌지??
    inviteRoom: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        const { guestId } = req.body;
        console.log(guestId);
        try {
            const existRoom = await Room.findById(roomId).exec(); //roomId에 해당하는 방 찾기
            console.log('초대된사람', existRoom.guestId);
            console.log('초대한사람', guestId);
            // 사용자가 방장이 아닐 때 초대 기능 동작 불가
            if (user.userId !== existRoom.ownerId) {
                res.status(400).send({
                    result: false,
                    message: '방장이 아니면 초대가 불가능합니다.',
                });
            } else if (existRoom.guestId.includes(guestId)) {
                res.send({ message: '이미 맛방에 있는 멤버입니다.' });
            } else {
                // roomId에 해당하는 DB 테이블을 찾아서 초대한 guestId 를 멤버 목록에 추가
                await Room.findByIdAndUpdate(
                    { _id: roomId },
                    { $push: { guestId: guestId } },
                    { upsert: true }
                );
                res.status(200).json({ result: true });
            }
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '초대하기 실패' });
        }
    },

    //맛방 강퇴
    kickRoom: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        const { guestId } = req.body;
        console.log(guestId);
        try {
            const existRoom = await Room.findById(roomId).exec(); //roomId에 해당하는 방 찾기

            // 사용자가 방장이 아닐 때 초대 기능 동작 불가
            if (user.userId !== existRoom.ownerId) {
                res.status(400).send({
                    result: false,
                    message: '방장이 아니면 초대가 불가능합니다.',
                });
            }
            await Room.findByIdAndUpdate(
                { _id: roomId },
                { $pull: { guestId: guestId } }
            );
            res.status(200).json({ result: true });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '사용자 강퇴 실패',
            });
        }
    },

    //맛방 수정
    rewriteRoom: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        const { roomName, emoji } = req.body;
        try {
            const existRoom = await Room.findById(roomId).exec();
            if (user.userId !== existRoom.ownerId) {
                res.status(400).send({
                    message: '방장이 아니면 수정이 불가능합니다.',
                });
            }
            await Room.findByIdAndUpdate(
                { id: roomId },
                { $set: { roomName, emoji } }
            );
            res.status(200).json({ result: true });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '맛방 수정 실패' });
        }
    },

    //맛방 삭제
    deleteRoom: async (req, res) => {
        const { roomId } = req.params;
        try {
            await Savelist.findByIdAndDelete({ roomId: roomId }); // 맛집 리스트 삭제
            await Room.findByIdAndDelete({ id: roomId }); // 맛방 삭제
            res.status(200).json({ result: true });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '맛방 삭제 실패' });
        }
    },

    //맛방 순서 변경 (userDB에 순서를 저장하는 테이블이 있어야하고, 전체목록 조회 때 순서대로 정렬해야함, sequence : {1:roomId, 2:roomId, 3:roomId )
    setSequenceRoom: async (req, res) => {
        try {
            res.status(200).send({ result: true });
        } catch (err) {
            res.status(400).send({ result: false, message: '순서 변경 실패' });
        }
    },
};

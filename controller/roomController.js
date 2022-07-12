const Room = require('../models/room');
const User = require('../models/user');
const Savelist = require('../models/savelist');
const Store = require('../models/store');
const UsersRoom = require('../models/UsersRoom');
const { find } = require('../models/room');

module.exports = {
    // 사용자 맛방 전체조회
    allRoom: async (req, res) => {
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

    // 사용자 검색
    // guestId : { userid, userId, userId}
    findUser: async (req, res) => {
        const { text } = req.body;
        const { user } = res.locals; // JWT 인증 정보

        try {
            //nickname, email, name 아무 값이나 다 검색하게 구현
            const findUser = await User.find({
                $or: [{ nickname: text }, { name: text }, { email: text }],
            });

            // DB에서 찾은 정보를 필요한 정보만 가공해서 출력
            const searchResult = findUser.map((a) => ({
                userId: a.id,
                nickname: a.nickname,
                name: a.name,
                faceColor: a.faceColor,
                eyes: a.eyes,
            }));

            // 찾은 정보가 빈 배열일 때 메세지
            if (Array.isArray(findUser) && findUser.length === 0) {
                return res.status(400).send({
                    result: false,
                    message: '존재하지 않는 사용자입니다.',
                });
            } else {
                // 찾은 정보가 있을 때 정보 출력 & 메세지
                return res.status(200).send({
                    message: '사용자 찾기 성공',
                    result: searchResult,
                });
            }
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '사용자 검색 실패',
            });
        }
    },

    //맛방 detail - 방 정보. 김상선!
    detailRoomInfo: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        try {
            // roomId로 현재 방 정보 찾기
            const existRoom = await Room.findById(roomId);

            // status를 배열에 하나씩 넣기 위한 빈 배열
            let roomStatus = '';
            if (existRoom.ownerId === user.userId && existRoom.guestId.length) {
                roomStatus = {
                    status: 'publicOwner',
                };
            } else if (
                existRoom.ownerId !== user.userId &&
                existRoom.guestId.length
            ) {
                roomStatus = {
                    status: 'publicGuest',
                };
            } else {
                roomStatus = {
                    status: 'private',
                };
            }
            res.status(200).send({
                result: true,
                roomId: existRoom.roomId,
                roomCode: existRoom.roomCode,
                roomName: existRoom.roomName,
                emoji: existRoom.emoji,
                status: roomStatus.status,
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
    detailRoomMember: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        try {
            const existRoom = await Room.findById(roomId).exec();

            //roomId에 해당하는 ownerId의 유저 정보
            const owner = await User.findById(existRoom.ownerId);

            //roomId에 해당하는 guestId들의 정보들을 배열로 생성하기 위한 빈 배열 선언.
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

            //프론트에서 방장의 캐릭터는 깃발 표식이 있기 때문에, 게스트들과 분리해서 출력
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
    detailRoomStoreList: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        try {
            //roomId가 같은 리스트 목록 찾기
            const existList = await Savelist.find({ roomId: roomId }).exec();

            // for문으로 Store 테이블에서 필요한 정보 뽑아오기 - map 함수로 변경하는게 효율적일지 고민하기
            let outList = []; // 필요한 정보만 넣기 위한 빈배열 선언
            for (i = 0; i < existList.length; i++) {
                findStore = await Store.findById(existList[i].storeId);
                outList.push({
                    storeName: findStore.storeName,
                    comment: existList[i].comment,
                    imgURL: findStore.imgURL,
                    tag: findStore.tag,
                });
            }
            res.status(200).json({
                result: true,
                storeList: outList,
                total: existList.length,
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '맛집 리스트 조회 실패',
            });
        }
    },

    //맛방 만들기 // roomName은 8글자로 제한하자. 프론트에서도 막을 듯
    // 방 초대인원 20명으로 제한 (게스트 19명)
    writeRoom: async (req, res) => {
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
            await UsersRoom.findOneAndUpdate(
                { userId: user.userId },
                { $push: { roomSeq: createdRoom.roomId } },
                { upsert: true }
            );
            // 만약 guest가 한명이라도 있다면 guest들의 맛방 목록에 맛방 추가
            if (!!guestId) {
                for (i = 0; i < guestId.length; i++) {
                    await UsersRoom.findOneAndUpdate(
                        { userId: guestId[i] },
                        { $push: { roomSeq: createdRoom.roomId } },
                        { upsert: true }
                    );
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

    // 맛방 초대 (공유하기)
    // roomCode를 활용하려면 맛방 입장하기 API도 별도로 필요함. (roomId 일치 && roomCode 일치)
    inviteRoom: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        const { userId } = req.body; //userId = [{userId1, userId2, userId}]

        try {
            const existRoom = await Room.findById(roomId).exec(); //roomId에 해당하는 방 찾기
            console.log(existRoom);
            //guestId가 배열이라면. 배열을 뜯어서 중복인원이 있는지 검사
            for (i = 0; i < userId.length; i++) {
                if (existRoom.guestId.some((a) => a === userId[i])) {
                    return res.send({
                        message: '이미 맛방에 있는 멤버입니다.',
                    });
                }
            }

            // if (existRoom.guestId.includes(userId)) {
            //     // 맛방에 이미 존재하는 게스트라면 요청 거절
            //     return res.send({ message: '이미 맛방에 있는 멤버입니다.22' });
            // }

            // 사용자가 방장이 아닐 때 초대 기능 동작 불가
            if (user.userId !== existRoom.ownerId) {
                return res.status(400).send({
                    result: false,
                    message: '방장이 아니면 초대가 불가능합니다.',
                });
            } else if (existRoom.guestId.length > 19) {
                //맛방 멤버 총 인원 20명으로 제한
                return res.status(400).send({
                    result: false,
                    message: '맛방의 최대 인원은 20명입니다.',
                });
            } else {
                // roomId에 해당하는 DB 테이블을 찾아서 초대한 guestId 를 멤버 목록에 추가
                await Room.findByIdAndUpdate(
                    { _id: roomId },
                    { $push: { guestId: userId } },
                    { upsert: true }
                );

                //초대한 멤버들의 맛방 리스트DB에 맛방 등록해주기.
                for (let i = 0; i < userId.length; i++) {
                    await UsersRoom.findOneAndUpdate(
                        { userId: userId[i] },
                        { $push: { roomSeq: roomId } },
                        { upsert: true }
                    );
                }
                return res.status(200).json({ result: true });
            }
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '초대하기 실패' });
        }
    },

    // 맛방에서 게스트 강퇴
    kickRoom: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        const { guestId } = req.body;

        try {
            // roomId에 해당하는 방 찾기
            const existRoom = await Room.findById(roomId).exec();
            console.log('찾고', existRoom);
            // 사용자가 방장이 아닐 때 강퇴 기능 동작 불가
            if (user.userId !== existRoom.ownerId) {
                return res.status(400).send({
                    result: false,
                    message: '방장이 아니면 강퇴가 불가능합니다.',
                });
            }

            // 강퇴할 guestId 회원의 맛방목록DB에서 맛방 제거
            const outedMember = await UsersRoom.findOneAndUpdate(
                { userId: guestId },
                { $pull: { roomSeq: roomId } }
            );
            console.log('유저룸', outedMember);

            // 강퇴할 guestId를 맛방DB에서 제거
            for (i = 0; i < guestId.length; i++) {
                await Room.findByIdAndUpdate(roomId, {
                    $pull: { guestId: guestId[i] },
                });
            }
            console.log('지우고', existRoom);
            return res.status(200).json({
                result: true,
                message: '일부 멤버가 맛방에서 제외되었습니다.',
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                result: false,
                message: '사용자 강퇴 실패',
            });
        }
    },

    // 맛방 정보 수정
    rewriteRoom: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;
        const { roomName, emoji } = req.body;
        try {
            // 맛방 DB에서 roodId에 해당하는 방 찾기
            const existRoom = await Room.findById(roomId).exec();

            // 방장이 아니면 실행 불가
            if (user.userId !== existRoom.ownerId) {
                res.status(400).send({
                    message: '방장이 아니면 수정이 불가능합니다.',
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
            res.status(400).send({ result: false, message: '맛방 수정 실패' });
        }
    },

    //맛방 삭제
    deleteRoom: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomId } = req.params;

        try {
            const existRoom = await Room.findById(roomId);
            console.log(existRoom);

            if (!existRoom) {
                return res
                    .status(400)
                    .send({ errorMessage: '맛방이 존재하지 않습니다!' });
            }
            // 맛집 리스트 삭제
            await Savelist.findOneAndDelete({ roomId: roomId });

            // 게스트 멤버들의 맛방목록 DB에서 맛방 삭제해주기.
            for (let i = 0; i < existRoom.guestId.length; i++) {
                await UsersRoom.findOneAndUpdate(
                    { userId: existRoom.guestId[i] },
                    { $pull: { roomSeq: roomId } }
                );
            }

            // 방장의 맛방목록 DB에서 맛방 삭제
            await UsersRoom.findOneAndUpdate(
                { userId: user.userId },
                { $pull: { roomSeq: roomId } }
            );

            // 맛방 삭제
            await Room.findByIdAndDelete(roomId);
            res.status(200).json({ result: true });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '맛방 삭제 실패' });
        }
    },

    //맛방 순서 변경
    // userDB에 순서를 저장하는 테이블이 있어야하고, 전체목록 조회 때 순서대로 정렬해야함, roomSeq : [{1:roomId}, {2:roomId}, {3:roomId}]
    setSequenceRoom: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { roomSeq } = req.body;
        try {
            const existRoom = await UsersRoom.findOne({
                userId: user.userId,
            }).exec();

            await UsersRoom.findOneAndUpdate(
                { userId: user.userId },
                { $set: { roomSeq: roomSeq } }
            );
            res.status(200).send({ result: true });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: false, message: '순서 변경 실패' });
        }
    },

    // 맛방에 저장
    saveStore: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { storeId, comment } = res.body;
        const { roomId } = res.params;
        try {
            // savelist DB에 저장
            await Savelist.create({
                storeId: storeId,
                roomId,
                comment,
            });
            res.status(200).send({
                result: true,
                message: '맛방에 저장 성공',
            });
        } catch (err) {
            console.log(err);
            res.send({ result: false, message: '맛방에 저장 실패' });
        }
    },
};

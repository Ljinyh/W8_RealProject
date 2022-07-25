const IO = require('socket.io');
const express = require('express');
const cors = require('cors');

// 모듈 불러오기
const User = require('./models/user');
const Room = require('./models/room');
// const UsersRoom = require('./models/usersRoom');
const Alert = require('./models/alret.js');
const Connect = require('./models/connect');

//soket cors 설정
const app = express();
app.use(cors(cors));

module.exports = (server) => {
    const io = IO(server, {
        cors: { origin: '*' },
    });

//===============================================================================================

let onlineUsers = [];

const addNewUser = (userId, nickname, socketId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
        onlineUsers.push({ userId, nickname, socketId });
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return onlineUsers.find((user) => user.userId === userId);
};

// 알림 등록시간
function timeForToday(createdAt) {
    const today = new Date();
    const timeValue = new Date(createdAt);

    const betweenTime = Math.floor(
        (today.getTime() - timeValue.getTime()) / 1000 / 60
    ); // 분

    if (betweenTime < 1) return '방금 전'; // 1분미만이면 방금 전
    if (betweenTime < 60) return `${betweenTime}분 전`; // 60분 미만이면 n분 전

    const betweenTimeHour = Math.floor(betweenTime / 60); // 시
    if (betweenTimeHour < 24) return `${betweenTimeHour}시간 전`; // 24시간 미만이면 n시간 전

    const betweenTimeDay = Math.floor(betweenTime / 60 / 24); //일
    if (betweenTimeDay < 7) return `${betweenTimeDay}일 전`; // 7일 미만이면 n일 전
    if (betweenTimeDay < 365)
        return `${timeValue.getMonth() + 1}월 ${timeValue.getDate()}일`; //365일 미만이면 년을 제외하고 월 일만

    return `${timeValue.getFullYear()}년 ${
        timeValue.getMonth() + 1
    }월 ${timeValue.getDate()}일`; // 365일 이상이면 년 월 일
}

//===============================================================================================

// 소켓 시작
io.on('connection', (socket) => {
io.emit('firstEvent', '소켓 연결 성공!');

//소켓 연결 시 Connect에 저장 및 연결상태 나타내기
socket.on('newUser', async ({ userId, nickname }) => {
    if (userId !== undefined) {
        addNewUser(userId, nickname, socket.id);
        const receiver = getUser(userId);
        const createdAt = new Date();
        const userFind = await Connect.findOneAndUpdate(
            { userId: userId, nickname: nickname },
            {
                $set: {
                    connected: true,
                    socketId: receiver.socketId,
                    connectedAt: createdAt,
                },
            },
            { upsert: true }
        );

        await Connect.findOne({ userId: userId });
    }
});

//멤버 초대 시 실시간 알림
socket.on('inviteMember', async ({ userId, guestName, roomId }) => {
    const findUser = await User.findById(userId);
    const findRoom = await Room.findById(roomId);
    const roomName = findRoom.roomName;
    const senderName = findUser.nickname;
    const createdAt = new Date();
    const type = '초대';

    for (let i = 0; i < guestName.length; i++) {
        const CheckAlert = await Alert.findOne({
            senderName: senderName,
            userId: guestName[i],
            roomName: roomName,
            type: type,
        });

        if (!CheckAlert) {
            await Alert.create({
                userId: guestName[i],
                senderName,
                roomName,
                roomId,
                type: type,
                createdAt,
            });
            const findUserAlertDB = await Alert.findOne({
                senderName: senderName,
                userId: guestName[i],
                roomName: roomName,
                type: type,
            });

            if(findUserAlertDB && findUserAlertDB.type === type){
            findUserAlertDB.createdAt = timeForToday(createdAt);

            const receiver = getUser(guestName[i]);

            io.to(receiver.socketId).emit('newInviteDB', {
                findUserAlertDB: [findUserAlertDB],
            }
        )};
        }
    }
});

// 방에 맛집 추가 시 알림
socket.on(
    'TheStore',
    async ({ roomId, userId, memberId, storeName }) => {
        if (roomId && userId) {
            const createdAt = new Date();
            const type = '맛집등록';

            const findUser = await User.findById(userId);
            const senderName = findUser.nickname;

            const findRoom = await Room.findById(roomId);
            const roomName = findRoom.roomName;

            for (let i = 0; i < memberId.length; i++) {
                if (findRoom) {
                    const findAlertDB = await Alert.findOne({
                        roomId: roomId,
                        senderName: senderName,
                        userId: memberId[i],
                        storeName: storeName,
                        type: type,
                    });

                    if (!findAlertDB) {
                        await Alert.create({
                            userId: memberId[i],
                            senderName: senderName,
                            roomName: roomName,
                            storeName: storeName,
                            roomId: roomId,
                            type,
                            createdAt,
                        });
                    }

                    const TheAlertDB = await Alert.findOne({
                        roomId: roomId,
                        senderName: senderName,
                        userId: memberId[i],
                        storeName: storeName,
                        type: type,
                    });

                    if (TheAlertDB && TheAlertDB.type === type) {
                        TheAlertDB.createdAt = timeForToday(createdAt);
                        const members = getUser(memberId[i]);

                        io.to(members.socketId).emit('AddStore', {
                            TheAlertDB: [TheAlertDB]
                        });
                    }
                }
            }
        }
    }
);

// 알림 목록 보내기
socket.on('getAlert', async ({ receiverId }) => {
            const receiver = getUser(receiverId);

            const findUserAlertDB = await Alert.find({
                userId: receiverId,
            });

            if(findUserAlertDB){
            for (let i=0; i<findUserAlertDB.length; i++) {
                findUserAlertDB[i].createdAt = timeForToday(alretDB.createdAt);
            
            io.to(receiver.socketId).emit('getNotification', {
                findAlertDB: findUserAlertDB,
            });
        }
        }
    });

//알림 삭제
socket.on('delete', async (alertId) => {
    await Alert.deleteOne({_id: alertId});
});

//로그아웃 시 연결 해제
socket.on('userOut', async (userId) => {
    const socketInUser = getUser(userId);
    const socketId = socketInUser.socketId;

    const findUserAlertDB = await Connect.findOne({ userId: userId, socketId: socketId });
    const createdAt = new Date();

    if (findUserAlertDB) {
        await Connect.findByIdAndUpdate(
            { _id: findUserAlertDB._id },
            {
                $set: [
                    {
                        connected: false,
                        connectedAt: createdAt,
                    },
                ],
            }
        );
        removeUser(socketId);
    }
});

//소켓 연결해제
socket.on('disconnect', async () => {
    const user = await Connect.findOne({ socketId: socket.id });
    const createdAt = new Date();
    if (user) {
        await Connect.updateOne(
            { socketId: socket.id },
            { $set: { connected: false, connectedAt: createdAt } }
        );
    }
    removeUser(socket.id);
       });
    });
};

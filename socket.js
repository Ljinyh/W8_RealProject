const IO = require('socket.io');
const express = require('express');
const cors = require('cors')

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
        cors: {
            origin: '*',
        },
    });

//===============================================================================================

    let onlineUsers = [];

    const addNewUser = (userId, nickname, socketId) => {
        !onlineUsers.some((user) => user.userId === userId) &&
            onlineUsers.push({ userId, nickname ,socketId });
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
            (today.getTime() - timeValue.getTime()) / 1000 /60
        ); // 분
        
        if(betweenTime < 1) return "방금 전"; // 1분미만이면 방금 전
        if(betweenTime < 60) return `${betweenTime}분 전` // 60분 미만이면 n분 전

        const betweenTimeHour = Math.floor(betweenTime / 60); // 시
        if(betweenTimeHour < 24) return `${betweenTimeHour}시간 전` // 24시간 미만이면 n시간 전

        const betweenTimeDay = Math.floor(betweenTime / 60 / 24); //일
        if(betweenTimeDay < 7) return `${betweenTimeDay}일 전` // 7일 미만이면 n일 전
        if(betweenTimeDay < 365) return `${timeValue.getMonth() +1}월 ${timeValue.getDate()}일` //365일 미만이면 년을 제외하고 월 일만

        return `${timeValue.getFullYear()}년 ${timeValue.getMonth() +1}월 ${timeValue.getDate()}일` // 365일 이상이면 년 월 일
    }

//===============================================================================================

    // 소켓 시작
    io.on('connection', (socket) => {
        io.emit('firstEvent', '소켓 연결 성공!');

        //소켓 연결 시 Connect에 저장 및 연결상태 나타내기
        socket.on('newUser', async({ userId, nickname }) => {
            if (userId !== undefined) {
                addNewUser(userId, nickname, socket.id);
                const receiver = getUser(userId);
                const createdAt = new Date();
                const userFind = await Connect.findOneAndUpdate({ userId: userId, nickname: nickname }, {
                    $set: {
                        connected: true,
                        socketId: receiver.socketId,
                        connectedAt: createdAt,
                    },
                }, { upsert: true });

                await Connect.findOne({ userId: userId });
            }
        });

        socket.on('inviteMember', async({userId, guestName, roomId}) => {
            const findUser = await User.findById(userId);
            const findRoom = await Room.findById(roomId);
            const roomName = findRoom.roomName;
            const senderName = findUser.nickname;
            const createdAt = new Date();

            for(let i=0; i<guestName.length; i++){
                
            const CheckAlert = await Alert.findOne({ senderName: senderName ,guestId: guestName[i], roomName: roomName});
    
            if(!CheckAlert){
                await Alert.create({
                    guestId: guestName[i],
                    senderName,
                    roomName,
                    createdAt
                });
                const findUserAlertDB = await Alert.findOne({ senderName: senderName ,guestId: guestName[i], roomName: roomName});
                findUserAlertDB.createdAt = timeForToday(createdAt);
                console.log(findUserAlertDB);
                console.log(findUserAlertDB.createdAt);

                const receiver = getUser(guestName[i]);
                console.log(receiver)
                console.log(onlineUsers)

                io.to(receiver.socketId).emit('newInviteDB',{
                    findUserAlertDB : [findUserAlertDB],
                });
            } else {
                socket.emit("errorMessage", "이미 초대한 회원입니다.");
                return;
            }}
        });

        //소켓 연결해제
        socket.on('disconnect', async() => {
            const user = await Connect.findOne({ socketId: socket.id });
            const createdAt = new Date();
            if(user){
                await Connect.updateOne({ socketId: socket.id },
                    {$set: { connected: false, connectedAt: createdAt }});
            }
            removeUser(socket.id);
        });
    });
};
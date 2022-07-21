const IO = require('socket.io');
const express = require('express');
const cors = require('cors')

// const User = require('./models/user');
// const Room = require('./models/room');
// const UsersRoom = require('./models/usersRoom');
const Connect = require('./models/connect');

const app = express();
app.use(cors(cors));
module.exports = (server) => {
    const io = IO(server, {
        cors: {
            origin: '*',
        },
    });

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

    io.on('connection', (socket) => {
        io.emit('firstEvent', '소켓 연결 성공!');

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

        //소켓 연결해제
        socket.on('disconnect', async() => {
            const user = await Connect.findOne({ socketId: socket.id });
            const createdAt = new Date();
            if(user){
                await Connect.updateOne({ socketId: socket.id },
                    {$set: { connected: false, connectedAt: createdAt }});
            }

        });
    });
};
const IO = require('socket.io');
const http = require('./app');

const User = require('./models/user');
const Room = require('./models/room');
const UsersRoom = require('./models/usersRoom');
const Connect = require('./models/connect');

const io = IO(http, {
    cors: {
        origin: '*',
    },
});

let onlineUsers = [];
const addNewUser = (userId, socketId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
        onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return onlineUsers.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
    console.log('소켓 연결이 되었나');

    io.emit('firstEvent', '소켓 연결 성공!');

    // socket.on('newUser', async({ userId }) => {
    //     if (userId !== undefined) {
    //         addNewUser(userId, socket.id);
    //         const receiver = getUser(userId);
    //         const createdAt = new Date();
    //         const userFind = await Connect.findOneAndUpdate({ userId: userId }, {
    //             $set: {
    //                 connected: true,
    //                 socketId: receiver.socketId,
    //                 connectedAt: createdAt,
    //             },
    //         }, { upsert: true });

    //         await Connect.findOne({ userId: userId });
    //     }
    // });

    socket.on('disconnect', () => {
        console.log('disconnected');
    });
});
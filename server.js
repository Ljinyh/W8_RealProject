//Server
const app = require('./app'); // app.js에서 http 객체 가져오기
const Socket = require('./socket');
require("dotenv").config

const server = app.listen(process.env.PORT, () => {
    console.log(process.env.PORT, '포트로 서버가 켜졌어요!');
});

Socket(server);
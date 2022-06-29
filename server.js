//Server
const app = require('./app'); // app.js에서 http 객체 가져오기
const port = require('./config/port.json');

app.listen(port.port, () => {
    console.log(port.port, '포트로 서버가 켜졌어요!');
});
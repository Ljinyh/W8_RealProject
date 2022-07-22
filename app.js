// express 패키지 불러옴
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const connectDB = require('./database/db');
const reqLogMiddleware = require('./middlewares/request-log-middleware');

// ============================
// Router
const indexRouter = require('./router/index');

// ============================
// Passport
const kakaoPassport = require('./passport/kakao'); //이애 연결해주고
const googlePassport = require('./passport/google');
const naverPassort = require('./passport/naver');

// ============================
// CORS Access - Origin
const corsOption = {
    origin: ['http://localhost:3000', 'https://weat.site'],
    credentials: true,
};

// ============================
// DB 연결 - log
connectDB();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// ============================
// 서버 어플리케이션
const app = express();

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
kakaoPassport(); //passport의 kakao.js에서 내보낸 함수 실행
googlePassport();
naverPassort();

// 미들웨어
app.use(reqLogMiddleware);
app.use(cors(corsOption));
app.use(morgan('dev'));
app.use(helmet());

// ============================
// 최상위 URL
app.get('/', (req, res) => {
    res.send('Hello! This is Backend Server');
});

// ============================
// 라우터 연결
app.use('/api', indexRouter);

module.exports = app; //모듈로 httpServer를 내보냄
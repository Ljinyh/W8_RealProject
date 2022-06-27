// express 패키지 불러옴
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const connectDB = require('./database/db')
const reqLogMiddleware = require('./middlewares/request-log-middleware')
require('dotenv').config()

// ============================
// Router
const userRouter = require('./router/userRouter')

// ============================
// CORS Access - Origin
const corsOption = {
    origin: [
        'http://localhost:3000',
        'https://d3p8bgs7s0qr62.cloudfront.net'
    ],
    credentials: true,
}

// ============================
// DB 연결 - log
connectDB()

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// ============================
// 서버 어플리케이션
const app = express();

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 미들웨어
app.use(reqLogMiddleware);
app.use(cors(corsOption));

// 최상위 URL
app.get('/', (req, res) => {
    res.send('Backend Server')
});

// 라우터 연결
app.use('/api/users', userRouter);


module.exports = app //모듈로 httpServer를 내보냄
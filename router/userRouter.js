const express = require('express');
const authMiddleware = require('../middlewares/auth-middleware');
const userController = require('../controller/userController');

const router = express.Router();

// 회원가입 API.
router.post('/signup', userController.signUp);

// 이메일, 비밀번호 중복확인
router.post('/check', userController.check);

//인증번호 이메일 발송 API
router.post('/mail', userController.sendMail);

//인증번호 문자 발송 API
router.post('/sms', userController.sendSMS);

// 로그인 API
router.post('/login', userController.login);

//아이디 찾기 API
router.post('/findUserId', userController.findUserId);

//비밀번호 찾기
router.post('/findPass', userController.findPass);

// 사용자 정보 조회 API, 로그인 시 사용
router.get('/me', authMiddleware, userController.userInfo);

module.exports = router;
const express = require('express');
const authMiddleware = require('../middlewares/auth-middleware');
const userController = require('../controller/userController');
const passport = require('passport');

const router = express.Router();

// 회원가입 API.
router.post('/signup', userController.signUp);

//sending Email
router.post('/mail', userController.sendMail);

// 로그인 API
router.post('/login', userController.login);

// 내 정보 조회 API, 로그인 시 사용
router.get('/me', authMiddleware, userController.userInfo);

// passport-kakao Login
router.get('/kakao', passport.authenticate('kakao'));

router.get('/auth/kakao/callback', userController.kakaoLogin);

module.exports = router;
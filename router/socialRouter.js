//라이브러리
const express = require('express');
const router = express.Router();
const passport = require('passport');

//controller 연결
const socialController = require('../controller/socialController');

// passport-kakao Login
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', socialController.kakaoLogin);

// passport-google Login
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', socialController.googleLogin);

// passport-naver Login
router.get('/naver', passport.authenticate('naver', null));

router.get('naver/callback', socialController.naverLogin);

module.exports = router;
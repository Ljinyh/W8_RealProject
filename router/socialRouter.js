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
router.get(
    '/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
    //scope를 profile로만 줬을때는 email이 안들어옴(반대는 nickName이 안들어옴)
);

router.get('/google/callback', socialController.googleLogin);

// passport-naver Login
router.get('/naver', passport.authenticate('naver', null));

router.get('/naver/callback', socialController.naverLogin);

module.exports = router;
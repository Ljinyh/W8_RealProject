const jwt = require('jsonwebtoken');
const passport = require('passport');
const KEY = require('../config/secret.json');

//Kakao callback Controller
exports.kakaoLogin = (req, res, next) => {
    passport.authenticate(
        'kakao', { failureRedirect: '/' },
        (err, user, info) => {
            if (err) return next(err);
            const { email, nickName } = user;
            const token = jwt.sign({ email }, KEY.SECRET_KEY, {
                expiresIn: '7d',
            });

            res.send({
                token,
                nickName,
                message: '로그인 되었습니다.',
            });
        }
    )(req, res, next);
};

// Google callback Controller
exports.googleLogin = (req, res, next) => {
    passport.authenticate(
        'google', { failureRedirect: '/' },
        (err, user, info) => {
            if (err) return next(err);
            const { snsId, nickName } = user;
            const token = jwt.sign({ snsId }, KEY.SECRET_KEY, {
                expiresIn: '7d',
            });

            res.send({
                token,
                nickName,
                message: '로그인 되었습니다.',
            });
        }
    )(req, res, next);
};

// Naver callback Controller
exports.naverLogin = (req, res, next) => {
    passport.authenticate(
        'naver', { failureRedirect: '/' },
        (err, user, info) => {
            if (err) return next(err);
            const { email, nickName } = user;
            const token = jwt.sign({ email }, KEY.SECRET_KEY, {
                expiresIn: '7d',
            });

            res.send({
                token,
                nickName,
                message: '로그인 되었습니다.',
            });
        }
    )(req, res, next);
};
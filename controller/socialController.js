const jwt = require('jsonwebtoken');
const passport = require('passport');
const KEY = require('../config/secret.json');
const User = require('../models/user');

//Kakao callback Controller
exports.kakaoLogin = (req, res, next) => {
    passport.authenticate(
        'kakao', { failureRedirect: '/' },
        (err, user, info) => {
            if (err) return next(err);
            const { userId } = user;

            const token = jwt.sign({ userId }, KEY.SECRET_KEY, {
                expiresIn: '7d',
            });
            res.redirect(`http://localhost:3000?token=${token}`);
        }
    )(req, res, next);
};

// Google callback Controller
exports.googleLogin = (req, res, next) => {
    passport.authenticate(
        'google', { failureRedirect: '/' },
        (err, user, info) => {
            if (err) return next(err);
            const { snsId } = user;
            const token = jwt.sign({ snsId }, KEY.SECRET_KEY, {
                expiresIn: '7d',
            });

            res.redirect(`http://localhost:3000?token=${token}`);
        }
    )(req, res, next);
};

// Naver callback Controller
exports.naverLogin = (req, res, next) => {
    passport.authenticate(
        'naver', { failureRedirect: '/' },
        (err, user, info) => {
            if (err) return next(err);
            const { snsId } = user;
            const token = jwt.sign({ snsId }, KEY.SECRET_KEY, {
                expiresIn: '7d',
            });

            res.redirect(
                `https://d3p8bgs7s0qr62.cloudfront.net/login?token=${token}`
            );
        }
    )(req, res, next);
};
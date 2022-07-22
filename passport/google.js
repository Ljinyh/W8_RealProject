const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
require('dotenv').config();

module.exports = () => {
    passport.use(
        new GoogleStrategy({
                clientID: process.env.GOOGLE_ID,
                clientSecret: process.env.GOOGLE_PASS,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async(accessToken, refreshToken, profile, done) => {
                try {
                    const exUser = await User.findOne({
                        snsId: profile.id,
                        provider: 'google',
                    });
                    if (exUser) {
                        done(null, exUser);
                    } else {
                        const newUser = await User.create({
                            name: profile.displayName,
                            snsId: profile.id,
                            email: profile._json.email,
                            provider: 'google',
                        });
                        done(null, newUser); // 회원가입하고 로그인 인증 완료
                    }
                } catch (error) {
                    console.error(error);
                    done(error);
                }
            }
        )
    );
};
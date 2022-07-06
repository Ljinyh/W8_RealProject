const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const googleinfo = require('../config/socialConfig.json');

module.exports = () => {
    passport.use(
        new GoogleStrategy({
                clientID: googleinfo.GOOGLE_ID,
                clientSecret: googleinfo.GOOGLE_PASS,
                callbackURL: googleinfo.GOOGLE_CALLBACK_URL,
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
                            nickname: profile.displayName,
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
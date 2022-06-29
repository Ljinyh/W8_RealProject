const passport = require('passport');
const naverStrategy = require('passport-naver').Strategy;
const User = require('../models/socialUser');
const NAVER = require('../config/socialConfig.json');

module.exports = () => {
    passport.use(
        new naverStrategy({
                clientID: NAVER.NAVER_ID,
                clientSecret: NAVER.NAVER_PASS,
                callbackURL: NAVER.NAVER_CALLBACK_URL,
            },

            async(accessToken, refreshToken, profile, done) => {
                try {
                    const exUser = await User.findOne(
                        // 카카오 플랫폼에서 로그인 했고 & snsId필드에 카카오 아이디가 일치할경우
                        { snsId: profile.id, provider: 'naver' }
                    );
                    // 이미 가입된 카카오 프로필이면 성공
                    if (exUser) {
                        done(null, exUser);
                    } else {
                        // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
                        const newUser = await User.create({
                            nickName: profile.username,
                            snsId: profile.id,
                            email: profile,
                            userImageURL: profile._json.properties.profile_image,
                            provider: 'naver',
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
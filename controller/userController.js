const jwt = require('jsonwebtoken')
const userDB = require('../models/user')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const mailer = require('../models/mail');

require('dotenv').config()

const UserSchema = Joi.object({
    userId: Joi.string()
        .required()
        .min(3),

    email: Joi.string()
        .required()
        .pattern(new RegExp('^[0-9a-zA-Z]+@+[0-9a-zA-Z]+.+[a-zA-Z]$')),

    nickName: Joi.string()
        .required()
        .pattern(new RegExp('^[ㄱ-ㅎ가-힣0-9a-zA-Z]{3,10}$')),

    password: Joi.string()
        .required()
        .pattern(new RegExp('^[ㄱ-ㅎ가-힣0-9a-zA-Z@$!%#?&]{4,10}$')),

    confirmPassword: Joi.string()
        .required()
        .min(3),

    phoneNum: Joi.number().min(8),

    userLocation: Joi.string(),

    favorability: Joi.number(),
})

//회원가입
exports.signUp = async(req, res) => {

    try {
        const { userId, email, nickName, phoneNum, userLocation, favorability, password, confirmPassword } =
        await UserSchema.validateAsync(req.body);

        if (password !== confirmPassword) {
            return res
                .status(400)
                .send({
                    errorMessage: '비밀번호와 비밀번호 확인의 내용이 일치하지 않습니다.',
                })
        }

        const existUsers = await userDB.findOne({ userId });
        if (existUsers) {
            return res
                .status(400)
                .send({ errorMessage: '중복된 아이디입니다.' });
        };

        const existNickname = await userDB.findOne({ nickName })
        if (existNickname) {
            return res
                .status(400)
                .send({ errorMessage: '중복된 닉네임입니다.' })
        };

        const existUsersEmail = await userDB.findOne({ email })
        if (existUsersEmail) {
            return res
                .status(400)
                .send({ errorMessage: '중복된 이메일입니다.' });
        };

        res.status(201).send({ message: '회원가입에 성공했습니다.' });

        const users = new userDB({ userId, email, nickName, userLocation, favorability, password, phoneNum })
        await users.save()
    } catch (err) {
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
    };
};

// 인증번호 메일로 보내기
exports.sendMail = async(req, res) => {
    const { email, nickName } = req.body; //회원가입시 입력한 정보 가져오기
    let authNum = Math.random().toString().substring(2, 6); //랜덤한 숫자 4자리 생성

    let emailParam = {
        toEmail: email,

        subject: '어디냥 인증번호 발급',

        text: `
        안녕하세요 ${nickName}님! 어디냥에서 인증번호 발급을 도와드릴게요!

        ${nickName}님의 인증번호는 <  ${authNum}  > 입니다.

        인증번호 입력란에 입력해 주세요! :)`

    };

    try {
        mailer.sendEmail(emailParam);

        res.status(200).send({ msg: `${nickName}님에게 메일 보내기 성공!`, authNum });
    } catch (error) {
        res.status(500).send({ errorMessage: '메세지 전송 싪패!' });
    };
};



//로그인
exports.login = async(req, res) => {
    const { userId, password } = req.body;
    const user = await userDB.findOne({ userId });
    try {
        if (!user) {
            return res.status(400).send({ errorMessage: '회원정보가 없습니다!' });
        }

        const userCompared = await bcrypt.compare(password, user.password);
        if (!userCompared) {
            return res
                .status(400)
                .send({ errorMessage: '이메일이나 비밀번호가 올바르지 않습니다.' })
        }

        //비밀번호까지 맞다면 토큰을 생성하기.
        const token = jwt.sign({ authorId: user.authorId },
            process.env.SECRET_KEY, { expiresIn: '24h' } //토큰 24으로 유효시간 지정
        )
        res.status(200).send({ message: `${userId}님이 로그인하셨습니다.`, token });
    } catch (err) {
        res.status(400).json({
            fail: '입력창을 확인 해주세요.',
        });
    };
};

//카카오 로그인
exports.kakaoLogin = (req, res, next) => {
    passport.authenticate(
        'kakao', {
            failureRedirect: '/',
        },
        (err, user, info) => {
            if (err) return res.status(401).json(err);
            const { userID, nickname } = user;
            const token = jwt.sign({ userID: userID, nickname: nickname },
                process.env.TOKEN_SECRET_KEY
            );
            res.json({ token, success: '카카오 로그인 성공!' });
        }
    )(req, res, next);
};

//사용자 인증
exports.userInfo = async(req, res) => {
    const { user } = res.locals
    res.send({
        user: {
            userId: user.userId,
            nickName: user.nickName,
            userLocation: user.userLocation,
            userImageURL: user.userImageURL,
        },
    })
}
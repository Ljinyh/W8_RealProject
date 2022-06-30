const jwt = require('jsonwebtoken');
const userDB = require('../models/user');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const mailer = require('../models/mail');

require('dotenv').config();

const UserSchema = Joi.object({
    userId: Joi.string().required().min(3),

    email: Joi.string()
        .required()
        .pattern(new RegExp('^[0-9a-zA-Z]+@+[0-9a-zA-Z]+.+[a-zA-Z]$')),

    nickName: Joi.string()
        .required()
        .pattern(new RegExp('^[ㄱ-ㅎ가-힣0-9a-zA-Z]{3,10}$')),

    password: Joi.string()
        .required()
        .pattern(new RegExp('^[ㄱ-ㅎ가-힣0-9a-zA-Z@$!%#?&]{4,10}$')),

    confirmPassword: Joi.string().required().min(3),

    phoneNum: Joi.number().min(8),

    userLocation: Joi.string(),

    favorability: Joi.number(),
});

//회원가입
exports.signUp = async(req, res) => {
    try {
        const { userId, email, nickName, phoneNum, password, confirmPassword } =
        await UserSchema.validateAsync(req.body);

        //회원가입시 기본 이미지
        const userImageURL =
            'https://kr.seaicons.com/wp-content/uploads/2015/06/person-icon.png';

        if (password !== confirmPassword) {
            return res.status(400).send({
                errorMessage: '비밀번호와 비밀번호 확인의 내용이 일치하지 않습니다.',
            });
        }

        const existUsers = await userDB.findOne({ userId });
        if (existUsers) {
            return res
                .status(400)
                .send({ errorMessage: '중복된 아이디입니다.' });
        }

        const existNickname = await userDB.findOne({ nickName });
        if (existNickname) {
            return res
                .status(400)
                .send({ errorMessage: '중복된 닉네임입니다.' });
        }

        res.status(201).send({ message: '회원가입에 성공했습니다.' });

        const users = new userDB({
            userId,
            email,
            nickName,
            password,
            phoneNum,
            userImageURL,
        });

        await users.save();
    } catch (err) {
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
    }
};

// 인증번호 메일로 보내기
exports.sendMail = async(req, res) => {
    const { email } = req.body; //회원가입시 입력한 정보 가져오기
    const authNum = Math.random().toString().substring(2, 6); //랜덤한 숫자 4자리 생성

    const existUsersEmail = await userDB.findOne({ email });

    const emailParam = {
        toEmail: email,
        subject: '어디냥 인증번호 발급',
        text: `
                안녕하세요 어디냥에서 인증번호 발급을 도와드릴게요!

                인증번호는 <  ${authNum}  > 입니다.

                인증번호 입력란에 입력해 주세요! :)`,
    };

    try {
        if (existUsersEmail) {
            return res
                .status(400)
                .send({ errorMessage: '중복된 이메일입니다.' });
        }

        if (!existUsersEmail) {
            mailer.sendEmail(emailParam);

            res.status(200).send({ msg: `메일 보내기 성공!`, authNum });
        }
    } catch (error) {
        res.status(500).send({ errorMessage: '메세지 전송 싪패!' });
    }
};

//로그인
exports.login = async(req, res) => {
    const { userId, password } = req.body;
    const user = await userDB.findOne({ userId });
    try {
        if (!user) {
            return res
                .status(400)
                .send({ errorMessage: '회원정보가 없습니다!' });
        }

        const userCompared = await bcrypt.compare(password, user.password);
        if (!userCompared) {
            return res.status(400).send({
                errorMessage: '이메일이나 비밀번호가 올바르지 않습니다.',
            });
        }

        //비밀번호까지 맞다면 토큰을 생성하기.
        const token = jwt.sign({ authorId: user.authorId },
            process.env.SECRET_KEY, { expiresIn: '24h' } //토큰 24으로 유효시간 지정
        );
        res.status(200).send({
            message: `${userId}님이 로그인하셨습니다.`,
            token,
        });
    } catch (err) {
        res.status(400).json({
            fail: '입력창을 확인 해주세요.',
        });
    }
};

//아이디 찾기
exports.findUserId = async(req, res) => {
    const { email } = req.body;

    const existUsersEmail = await userDB.findOne({ email });

    if (!existUsersEmail || existUsersEmail === null) {
        return res.status(400).send({ errorMessage: '아이디 찾기 실패!' });
    }
    const userId = existUsersEmail.userId;

    return res.status(200).json({ msg: '아이디 찾기 성공!', userId });
};

//비밀번호 찾기
exports.findPass = async(req, res) => {
    const { email, userId } = req.body;

    //랜덤으로 36진수의 값 만들기(소숫점 뒤부터)
    let tempPassword = Math.random().toString(36).slice(2);

    const existUserPass = await userDB.findOne({ email, userId });

    if (!existUserPass || existUserPass === null) {
        return res.status(400).send({
            errorMessage: '작성란이 비어있거나 회원등록이 되어있지 않는 사용자입니다.',
        });
    }

    //임시비밀번호 이메일로 전송
    const emailParam = {
        toEmail: email,
        subject: '어디냥 임시비밀번호 발급',
        text: `
                안녕하세요 ${userId}님! 임시비밀번호를 보내드려요!
        
                임시비밀번호는 <  ${tempPassword}  > 입니다.
        
                입력 후 회원정보란에서 꼭 변경해주시길 바랍니다! :)`,
    };

    try {
        mailer.sendEmail(emailParam);

        res.status(200).send({ msg: `메일 보내기 성공!` });
        //메일 보내기
    } catch (error) {
        res.status(500).send({ errorMessage: '메세지 전송 싪패!' });
    }

    if (existUserPass) {
        //임시로 발급된 비밀번호 암호화
        tempPassword = bcrypt.hashSync(tempPassword, 10);

        //등록된 비밀번호를 임시비밀번호로 수정
        await userDB.findByIdAndUpdate(existUserPass, {
            $set: { password: tempPassword },
        });
    } else {
        return res.status(400).send({ errorMessage: '비밀번호 찾기 실패!' });
    }
};

//사용자 인증
exports.userInfo = async(req, res) => {
    const { user } = res.locals;
    res.send({
        user: {
            userId: user.userId,
            nickName: user.nickName,
            userImageURL: user.userImageURL,
        },
    });
};
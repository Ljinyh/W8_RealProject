const jwt = require('jsonwebtoken');
const userDB = require('../models/user');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const mailer = require('../models/mail');
const User = require('../models/user');
const Room = require('../models/room');
const UsersRoom = require('../models/usersRoom');
const Alert = require('../models/alret');
const Like = require('../models/like');
const Connect = require('../models/connect');

// const send_message = require('../module/sms'); //sms module

require('dotenv').config();
//================================================================================
//회원가입 validation
const UserSchema = Joi.object({
    customerId: Joi.string().min(2).required(),

    email: Joi.string()
        .required()
        .pattern(new RegExp('^[0-9a-zA-Z]+@+[0-9a-zA-Z]+.+[a-zA-Z]$')),

    nickname: Joi.string()
        .required()
        .pattern(new RegExp('^[ㄱ-ㅎ가-힣0-9a-zA-Z]{3,8}$')),

    password: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[@$!%*#?&])[A-Za-z0-9@$!%*#?&]{6,}$')),

    birthDay: Joi.string().min(8),
}).unknown(); // 정의되지 않은 key도 허용

//비밀번호 validation
const checkUserPass = Joi.object({
    password: Joi.string()
        .required()
        .min(6)
        .pattern(new RegExp('^(?=.*[@$!%*#?&])[A-Za-z0-9@$!%*#?&]{6,}$'))
        .messages({
            'string.empty': '{{#label}}를 채워주세요.',
            'string.min': `{{#label}}를 최소 6자이상 써주세요!`,
            'string.pattern.base': '특수문자가 들어가야합니다.',
        }),

    confirmPassword: Joi.string().min(3).messages({
        'string.empty': '{{#label}} 를 채워주세요.',
        'string.min': '{{#label}}은 최소 3글자 이상입니다.',
    }),
}).unknown();

//ID validation
const checkUser = Joi.object({
    customerId: Joi.string()
        .required()
        .min(3)
        .max(11)
        .pattern(new RegExp('^[ㄱ-ㅎ가-힣0-9a-zA-Z]{3,11}$'))
        .messages({
            'string.empty': '{{#label}}를 채워주세요.',
            'string.min': `{{#label}}를 최소 3자이상 써주세요!`,
            'string.max': '{{#label}}는 최대 11글자입니다.',
        }),
}).unknown();

//email validation
const emailValidation = Joi.object({
    email: Joi.string()
        .required()
        .pattern(new RegExp('^[0-9a-zA-Z]+@+[0-9a-zA-Z]+.+[a-zA-Z]$')),
}).unknown();

//================================================================================
//회원가입
exports.signUp = async(req, res) => {
    try {
        let {
            customerId,
            email,
            name,
            birthDay,
            nickname,
            password,
            faceColor,
            eyes,
        } = await UserSchema.validateAsync(req.body);

        const existNickname = await userDB.findOne({ nickname });
        if (existNickname) {
            return res
                .status(400)
                .send({ errorMessage: '중복된 닉네임입니다.' });
        }

        password = bcrypt.hashSync(password, 10);

        const users = new userDB({
            customerId,
            email,
            nickname,
            name,
            birthDay,
            password,
            faceColor,
            eyes,
        });

        await users.save();

        res.status(201).send({ message: '회원가입에 성공했습니다.' });
    } catch (err) {
        console.log(err);
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
    }
};

//================================================================================
//아이디 중복확인API
exports.check = async(req, res) => {
    try {
        const { customerId } = await checkUser.validateAsync(req.body);

        const existUsers = await userDB.findOne({ customerId });

        if (existUsers) {
            return res
                .status(400)
                .send({ errorMessage: '중복된 아이디입니다.' });
        }
        res.status(200).send({ result: 'success' });
    } catch (err) {
        console.log(err);
        res.status(400).send({
            result: false,
            errorMessage: '형식에 맞지 않습니다.',
        });
    }
};

//================================================================================
//비밀번호 중복확인API
exports.PassCehck = async(req, res) => {
    try {
        const { password, confirmPassword } = await checkUserPass.validateAsync(
            req.body
        );

        if (password !== confirmPassword) {
            return res.status(400).send({
                errorMessage: '비밀번호와 비밀번호 확인의 내용이 일치하지 않습니다.',
            });
        }
        res.status(200).send({ result: 'success' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ errorMessage: 'error' });
    }
};

//================================================================================
// 이메일 중복확인 및 인증번호 메일로 보내기
exports.sendMail = async(req, res) => {
    const { email } = await emailValidation.validateAsync(req.body);

    const authNum = Math.random().toString().substring(2, 6); //랜덤한 숫자 4자리 생성

    const existUsersEmail = await userDB.findOne({ email });

    if (existUsersEmail) {
        return res.status(400).send({ errorMessage: '중복된 이메일입니다.' });
    }

    const emailParam = {
        toEmail: email,
        subject: 'Weat 인증번호 발급',
        text: `
                안녕하세요 Weat에서 인증번호 발급을 도와드릴게요!
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
        console.log(error);
        res.status(500).send({
            errorMessage: '메세지 전송 실패!',
        });
    }
};

//================================================================================
//로그인
exports.login = async(req, res) => {
    const { customerId, password } = req.body;
    const user = await userDB.findOne({ customerId: customerId });
    try {
        if (!customerId || !password) {
            return res
                .status(400)
                .send({ errorMessage: '입력칸을 채워주세요!' });
        }

        if (!user) {
            return res
                .status(400)
                .send({ errorMessage: '회원정보가 없습니다!' });
        }

        const userCompared = await bcrypt.compare(password, user.password);
        if (!userCompared) {
            return res.status(400).send({
                errorMessage: '아이디나 비밀번호가 올바르지 않습니다.',
            });
        }

        //비밀번호까지 맞다면 토큰을 생성하기.
        const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, {
            expiresIn: '3d',
        });
        res.status(200).send({
            message: `${customerId}님이 로그인하셨습니다.`,
            token,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            fail: '입력창을 확인 해주세요.',
        });
    }
};

//================================================================================
//아이디 찾기 시 인증번호 이메일로 보내기
exports.mailSending = async(req, res) => {
    const { email } = req.body;

    const authNum = Math.random().toString().substring(2, 6); //랜덤한 숫자 4자리 생성

    const existUsersEmail = await userDB.findOne({ email: email });
    try {
        if (!email) {
            return res
                .status(400)
                .send({ errorMessage: '입력칸을 채워주세요' });
        }

        if (!existUsersEmail) {
            return res
                .status(400)
                .send({ errorMessage: '등록된 이메일이 없습니다!' });
        } else {
            const emailParam = {
                toEmail: email,
                subject: 'Weat 인증번호 발급',
                text: `
                    안녕하세요 Weat에서 인증번호 발급을 도와드릴게요!
                    인증번호는 <  ${authNum}  > 입니다.
                    인증번호 입력란에 입력해 주세요! :)`,
            };

            mailer.sendEmail(emailParam);

            res.status(200).send({ msg: '메세지 보내기 성공', authNum });
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: false, err });
    }
};

//================================================================================
//아이디 찾기
exports.findUserId = async(req, res) => {
    const { email } = req.body;

    const existUsersEmail = await userDB.findOne({ email: email });

    try {
        if (!existUsersEmail || existUsersEmail === null) {
            return res.status(400).send({ errorMessage: '아이디 찾기 실패!' });
        }
        const name = existUsersEmail.customerId;

        return res.status(200).json({
            msg: '아이디 찾기 성공!',
            customerId: name,
            createdAt: existUsersEmail.createdAt.toISOString(),
        });
    } catch (err) {
        res.status(400).send(console.log(err));
    }
};

//================================================================================
//비밀번호 찾기
exports.findPass = async(req, res) => {
    const { email, customerId } = req.body;

    //랜덤으로 36진수의 값 만들기(소숫점 뒤부터)
    let tempPassword = Math.random().toString(36).slice(2);

    const existUserPass = await userDB.findOne({ email, customerId });

    if (!existUserPass || existUserPass === null) {
        return res.status(400).send({
            errorMessage: '작성란이 비어있거나 회원등록이 되어있지 않는 사용자입니다.',
        });
    }

    //임시비밀번호 이메일로 전송
    const emailParam = {
        toEmail: email,
        subject: 'Weat 임시비밀번호 발급',
        text: `
                안녕하세요 ${existUserPass.nickname}님! 임시비밀번호를 보내드려요!
        
                임시비밀번호는 <  ${tempPassword}  > 입니다.
        
                입력 후 회원정보란에서 꼭 변경해주시길 바랍니다! :)`,
    };

    try {
        mailer.sendEmail(emailParam);

        res.status(200).send({ msg: `메일 보내기 성공!` });
        //메일 보내기
    } catch (error) {
        console.log(error);
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

//================================================================================
//SMS 문자 인증
/*
                    exports.sendSMS = (req, res) => {
                        const { phoneNum } = req.body;
                        const authNum = Math.random().toString().substring(2, 6);

                        try {
                            if (phoneNum) {
                                send_message(authNum, phoneNum);
                                res.status(200).send({ msg: '문자보내기 성공!', authNum });
                            }
                        } catch (error) {
                            res.status(500).send({ errorMessage: '문자보내기 실패' });
                            console.log(error);
                        }
                    };
                    */
//================================================================================
//유저 정보 수정
exports.userinfoEdit = async(req, res) => {
    const { userId } = res.locals.user;
    const { nickname, name, birthDay, faceColor, eyes } = req.body;

    const users = await userDB.findById(userId).exec();

    try {
        if (nickname) {
            const existNickname = await userDB.findOne({ nickname: nickname });
            if (existNickname) {
                return res
                    .status(400)
                    .send({ errorMessage: '중복된 닉네임입니다.' });
            }
        }

        if (users) {
            await userDB.findByIdAndUpdate({ _id: users._id }, {
                $set: {
                    nickname: nickname,
                    name: name,
                    birthDay: birthDay,
                    faceColor: faceColor,
                    eyes: eyes,
                },
            });
            return res.status(201).json({
                msg: '회원정보가 수정되었습니다.',
            });
        }

        res.status(400).send({ errorMessage: '회원정보 수정 실패!' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ errorMessage: '예외처리 에러' });
    }
};

//================================================================================
// 비밀번호 수정
exports.passSet = async(req, res) => {
    const { user } = res.locals;
    let { thePassword, password } = await checkUserPass.validateAsync(
        req.body
    );

    try {
        const theUser = await User.findById(user.userId);
        const userCompared = await bcrypt.compare(thePassword, theUser.password);

        if (!theUser || !userCompared) {
            return res.status(400).send({ errorMessage: '비밀번호가 맞지 않거나 회원이 존재하지 않습니다!' });
        }

        if (theUser && userCompared) {
            await User.findByIdAndUpdate(user.userId, {
                $set: { password: bcrypt.hashSync(password, 10) }
            });

            return res.status(200).send({ msg: '비밀번호 바꾸기 성공!' })
        }

        res.status(400).send({ errorMessage: '비밀번호 바꾸기 실패!' })

    } catch (err) {
        console.log(err)
        res.status(400).send({ errorMessage: 'ERROR!' })
    }
};

//================================================================================
//회원 탈퇴
exports.deleteUser = async(req, res) => {
    const { userId } = res.locals.user;
    const findUser = await User.findById(userId);
    const theRoom = await Room.find({ $or: [{ ownerId: userId }, { guestId: userId }] });
    const existAlert = await Alert.find({ userId: userId });
    const existUsersRoom = await UsersRoom.findOne({ userId: userId });
    const existConnect = await Connect.findOne({ userId: userId });
    const existLike = await Like.find({ userId: userId });

    try {
        if (!findUser) {
            return res.status(400).send({ errorMessage: '회원이 존재하지 않습니다!' });
        }

        if (findUser) {
            if (existConnect) {
                await Connect.findByIdAndDelete(existConnect._id);
            }
            if (existAlert) {
                await Alert.deleteMany({ userId: userId });
            }

            if (theRoom) {
                const ownerRoom = theRoom.filter((e) => e.ownerId === userId);
                const guestRoom = theRoom.filter((e) => e.guestId.includes(userId));

                if (guestRoom !== 0 || ownerRoom !== 0) {
                    for (let i = 0; i < guestRoom.length; i++) {
                        await UsersRoom.findOneAndUpdate({ roomSeq: guestRoom[i]._id }, {
                            $pull: { roomSeq: guestRoom[i]._id }
                        })

                        await Room.findByIdAndUpdate(guestRoom[i]._id, {
                            $pull: { guestId: userId }
                        })
                    };

                    for (let i = 0; i < ownerRoom.length; i++) {
                        await UsersRoom.findOneAndUpdate({ roomSeq: ownerRoom[i]._id }, {
                            $pull: { roomSeq: ownerRoom[i]._id }
                        })
                        await Room.findByIdAndDelete(ownerRoom[i]._id);
                    }

                }

                if (existUsersRoom.roomSeq.length === 0) {
                    await UsersRoom.deleteOne({ userId: userId })
                }

                if (existLike) {
                    await Like.deleteMany({ userId: userId });
                }

            }

            await User.findByIdAndDelete(userId);
            return res.status(200).send({ msg: '회원 삭제 성공!' });
        }

        res.status(400).send({ errorMessage: '회원 삭제 실패!' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ errorMessage: 'error!' });
    }
};

//================================================================================
//사용자 인증
exports.userInfo = async(req, res) => {
    const { user } = res.locals;
    try {
        return res.status(200).send({
            user: {
                userId: user.userId,
                name: user.name,
                birthDay: user.birthDay,
                email: user.email,
                customerId: user.customerId,
                nickname: user.nickname,
                faceColor: user.faceColor,
                eyes: user.eyes,
                provider: user.provider,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({ errorMessage: '회원정보 가져오기 실패' });
    }
};
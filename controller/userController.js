const jwt = require("jsonwebtoken");
const userDB = require("../models/user");
const Joi = require("joi");
const bcrypt = require("bcrypt");

require("dotenv").config();

const UserSchema = Joi.object({
    userId:
        Joi.string()
        .required()
        .min(3),
    
    email: 
        Joi.string()
        .required()
        .pattern(new RegExp('^[0-9a-zA-Z]+@+[0-9a-zA-Z]+.+[a-zA-Z]$')),
    
    password: 
        Joi.string()
        .required()
        .pattern(new RegExp('^[ㄱ-ㅎ가-힣0-9a-zA-Z@$!%#?&]{3,10}$')),
    
    confirmPassword: 
        Joi.string()
        .required()
        .min(3),
});


//회원가입
async function signUp (req, res) {
    try{
    const { userId, email, password, confirmPassword } = await UserSchema.validateAsync(req.body);

    if (password !== confirmPassword) {
        return res.status(400).send({ errorMessage: '비밀번호와 비밀번호 확인의 내용이 일치하지 않습니다.', });
    }
    
    const existUsers = await userDB.findOne({userId});
    if(existUsers){
        return res.status(400).send({errorMessage: '중복된 아이디입니다.',});
    }
    
    const existUsersEmail = await userDB.findOne({email});
    if(existUsersEmail){
        return res.status(400).send({ errorMessage: '중복된 이메일입니다.', });
        }

    res.status(201).send({ message : "회원가입에 성공했습니다."});

    const users = new userDB({ userId, email, password });
    await users.save();

} catch(err) {
    res.status(400).send({
        errorMessage: '요청한 데이터 형식이 올바르지 않습니다.'
    });
}};

//로그인
async function login(req, res) {
    const { userId, password } = req.body;
    const user = await userDB.findOne({userId});

    if(!user){
        return res.status(400).send({errorMessage: "회원정보가 없습니다!"});
    }

    const userCompared = await bcrypt.compare(password, user.password);
    if(!userCompared){
        return res.status(400).send({errorMessage: "이메일이나 비밀번호가 올바르지 않습니다."})
    }

       //비밀번호까지 맞다면 토큰을 생성하기.
        const token = jwt.sign({ authorId: user.authorId }, process.env.SECRET_KEY,{expiresIn: '24h'});
        res.status(200).send({ message : "로그인에 성공했습니다." , userId, token });
    }

//사용자 인증
async function userInfo(req, res) {
    const { user } = res.locals;
    res.send({
        user:{
            userId: user.userId
        }
    });
};


module.exports.signUp = signUp;
module.exports.login = login;
module.exports.userInfo = userInfo;

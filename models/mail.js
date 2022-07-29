const nodemailer = require('nodemailer');
require("dotenv").config();

const mailSender = {
    sendEmail: function(param) {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // 메일 보내는 곳
            port: 465,
            host: 'smtp.gmlail.com',
            secure: true,
            requireTLS: true,
            auth: {
                user: process.env.MAILUSER, // 보내는 메일의 주소
                pass: process.env.MAILPASS, // 보내는 메일의 비밀번호
            },
        });
        // 메일 옵션
        const mailOptions = {
            from: process.env.USER, // 보내는 메일의 주소
            to: param.toEmail, // 수신할 이메일
            subject: param.subject, // 메일 제목
            text: param.text, // 메일 내용
        };

        // 메일 발송
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    },
};

module.exports = mailSender;
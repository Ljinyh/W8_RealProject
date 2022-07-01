const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/../config/s3.json');

const s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'xoxokss', // 버킷 이름
        // limits: { fileSize: 5 * 1024 * 1024 }, // 용량제한
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE, // 컨텐츠 타입 자동 지정
        key: function (req, file, cb) {
            cb(null, `${Date.now().toString()}_${file.originalname}`); //저장되는 파일명
        },
    }),
});

module.exports = upload;

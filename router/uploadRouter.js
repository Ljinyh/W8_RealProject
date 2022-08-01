const express = require('express');
const router = express.Router();
const UploadController = require('../controller/uploadController');
const upload = require('../middlewares/multerS3');

// 멀티파트 폼데이터 변수 선언. 두개의 폼필드 안에 필드 네임으로 나눔.
const multiImg = upload.image.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
    { name: 'image5', maxCount: 1 },
]);

// 이미지 업로더
router.post('/image', upload.image.array('image', 5), UploadController.imageUploader)

// 단일 이미지 업로드
router.post('/single', upload.image.single('image'), UploadController.singleImage);

// 멀티파트폼 업로드
router.post('/multi', multiImg, UploadController.multiImages);


module.exports = router;

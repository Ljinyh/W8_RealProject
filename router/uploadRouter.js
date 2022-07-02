const express = require('express');
const router = express.Router();
const UploadController = require('../controller/uploadController');
const upload = require('../middlewares/multerS3');

// 멀티파트 폼데이터 변수 선언. 두개의 폼필드 안에 필드 네임으로 나눔.
const multiImg = upload.image.fields([
    { name: 'image', maxCount: 5 },
    { name: 'images', maxCount: 10 },
]);

// 1차 스코프. 이미지 업로더
router.post('/image', upload.image.array('image', 5), UploadController.imageUploader);

// 2차 스코프. 사운드 업로더
router.post('/sound', upload.sound.array('sound', 5), UploadController.soundUploader);

// 단일 이미지 업로드
router.post('/single', upload.image.single('image'), UploadController.singleImage);

// 배열로 이미지 업로드 - 파일수 5개로 제한
router.post('/array', upload.image.array('image', 5), UploadController.arrayImages);

// 멀티파트폼 업로드
router.post('/multi', multiImg, UploadController.multiImages);

// router.get('/get', upload.single('photo'), UploadController.Get);

module.exports = router;

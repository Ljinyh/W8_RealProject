const express = require('express');
const router = express.Router();
const imageController = require('../controller/imageController');
const upload = require('../middlewares/multerS3');

// 멀티파트 폼데이터 변수 선언. 두개의 폼필드 안에 필드 네임으로 나눔.
const multiImg = upload.fields([
    { name: 'image', maxCount: 5 },
    { name: 'images', maxCount: 10 },
]);

// 1차 스코프 작성
router.post('/upload', upload.array('image', 5), imageController.basicUploader);

// 단일 이미지 업로드
router.post('/single', upload.single('image'), imageController.singleImage);

// 배열로 이미지 업로드 - 파일수 5개로 제한
router.post('/array', upload.array('image', 5), imageController.arrayImages);

// 멀티파트폼 업로드
router.post('/multi', multiImg, imageController.multiImages);

// router.get('/get', upload.single('photo'), imageController.Get);

module.exports = router;

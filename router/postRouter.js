const express = require('express');
const router = express.Router();
const upload = require("../middlewares/multerS3")
const authMiddleware = require('../middlewares/auth-middleware');
const postController = require('../controller/postController');



// 전시회 게시글 전체조회 API.
router.get('/', postController.allPost);

// 전시회 상세조회 - 소개 API
router.get('/exhibit/:postId/intro', postController.introPost);

// 전시회 상세조회 - 전시안내 API
router.get('/exhibit/:postId/information', postController.infoPost);

// 전시회 게시글 작성 API
router.post('/exhibit', postController.writePost);

// 전시회 게시글 수정 API
router.put('/exhibit/:postId', postController.rewritePost);

// 전시회 게시글 삭제 API
router.delete('/exhibit/:postId', postController.deletePost);

module.exports = router;

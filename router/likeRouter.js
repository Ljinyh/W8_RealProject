const express = require('express');
const router = express();
const authMiddleware = require('../middlewares/auth-middleware');
const likeController = require('../controller/likeController');

// 추천 메뉴 좋아요 토글
router.post('/menu/:menuId', authMiddleware, likeController.likeMenu);

// 추천 메뉴 좋아요 취소
router.delete('/menu/:menuId', authMiddleware, likeController.unlikeMenu);

// 맛마디 좋아요 토글
router.post('/:madiId', authMiddleware, likeController.likeMatmadi);

// 맛마디 좋아요 취소
router.delete('/:madiId', authMiddleware, likeController.unlikeMatmadi);

module.exports = router;

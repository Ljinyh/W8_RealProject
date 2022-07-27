const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const analyzeController = require('../controller/analyzeCotroller');

// 달기록 & 총리뷰수
router.get('/', authMiddleware, analyzeController.getAnalyze);

// 먹매치
router.get('/match', authMiddleware, analyzeController.ReviewMatch);

// 리뷰왕
router.get('/re-King', authMiddleware, analyzeController.ReviewKing);

// 발견왕
router.get('/post-King', authMiddleware, analyzeController.PostKing);

// 특정 맛집 맛태그 목록조회
router.get('/:storeId/tag', authMiddleware, analyzeController.tagRank);

// 나의 최애 음식
router.get('/tag', authMiddleware, analyzeController.MyFavorite);

module.exports = router;
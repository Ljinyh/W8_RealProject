const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const storeController = require('../controller/storeController')

// 맛집 생성 (첫 기록하기)
router.post('/:roomId', authMiddleware, storeController.createStore);

module.exports = router;
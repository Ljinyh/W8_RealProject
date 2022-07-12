const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const storeController = require('../controller/storeController');

//맛집 첫기록하기
router.post('/:roomId', authMiddleware, storeController.firstMapSave);

module.exports = router;
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const RivewController = require('../controller/reviewController');

router.get('/', authMiddleware, RivewController.getReviews);

module.exports = router;
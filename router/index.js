const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('Backend server API page');
});

router.use('/users', require('./userRouter'));
router.use('/auth', require('./socialRouter'));
router.use('/post', require('./postRouter'));
router.use('/image', require('./imageRouter'));


module.exports = router;

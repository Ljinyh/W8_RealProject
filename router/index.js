const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Backend server API page');
});

router.use('/users', require('./userRouter'));
router.use('/auth', require('./socialRouter'));
router.use('/rooms', require('./roomRouter'));
router.use('/store', require('./storeRouter'));
router.use('/upload', require('./uploadRouter'));
router.use('/review', require('./reviewRouter'));

module.exports = router;
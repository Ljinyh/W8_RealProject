const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('Backend server API page');
});

router.use('/users', require('./userRouter'));
router.use('/auth', require('./socialRouter'));

module.exports = router;

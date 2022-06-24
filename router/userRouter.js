const express = require('express')
const authMiddleware = require('../middlewares/auth-middleware')
const userController = require('../controller/userController')

const router = express.Router()

// 회원가입 API.
router.post('/signup', userController.signUp)

// 로그인 API
router.post('/login', userController.login)

// 내 정보 조회 API, 로그인 시 사용
router.get('/me', authMiddleware, userController.userInfo)

module.exports = router

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const roomController = require('../controller/roomController');

// 사용자 맛방 전체조회
router.get('/rooms', authMiddleware, roomController.allRoom);

//맛방 detail - 방 정보
router.get('/rooms/:roomId', authMiddleware, roomController.detailRoomInfo);

//맛방 detail - 멤버 리스트
router.get('/users/:roomId', authMiddleware, roomController.detailRoomMember);

//맛방 detail - 맛집 리스트
router.get('/storeList/:roomId', authMiddleware, roomController.detailRoomStoreList);

//맛방 만들기
router.post('/rooms', authMiddleware, roomController.writeRoom);

//맛방 초대 (공유하기)
router.post('/invite/:roomId', authMiddleware, roomController.inviteRoom);

//맛방 수정
router.put('/rooms/:roomId', authMiddleware, roomController.rewriteRoom);

//맛방 삭제
router.delete('/rooms/:roomId', authMiddleware, roomController.deleteRoom);

//맛방 순서 변경
router.put('/roomSet/:roomId', authMiddleware, roomController.setSequenceRoom);

module.exports = router;

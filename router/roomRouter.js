const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const roomController = require('../controller/roomController');

// 사용자 맛방 전체조회
router.get('/rooms', authMiddleware, roomController.allRoom);

//사용자 찾기 API
router.get('/rooms/findUser', authMiddleware, roomController.findUser);

//맛방 detail - 방 정보
router.get('/rooms/:roomId', authMiddleware, roomController.detailRoomInfo);

//맛방 detail - 멤버 리스트
router.get('/users/:roomId', authMiddleware, roomController.detailRoomMember);

//맛방에 맛집 저장
router.post(
    '/rooms/:roomId/storeList',
    authMiddleware,
    roomController.detailRoomSave
);

//맛방 detail - 맛집 리스트
router.get(
    '/rooms/:roomId/storeList',
    authMiddleware,
    roomController.detailRoomStoreList
);

//맛방 만들기
router.post('/rooms', authMiddleware, roomController.writeRoom);

//맛방 초대 (공유하기)
router.post('/:roomId/invite', authMiddleware, roomController.inviteRoom);

//맛방 수정
router.put('/rooms/:roomId', authMiddleware, roomController.rewriteRoom);

//맛방 삭제
router.delete('/rooms/:roomId', authMiddleware, roomController.deleteRoom);

//맛방 순서 변경
router.put('/roomSet', authMiddleware, roomController.setSequenceRoom);

//맛집 첫기록하기
router.post('/store/:roomId', authMiddleware, roomController.firstMapSave);

//맛방에 있는 사람 강퇴하기
router.put('/:roomId/kickUser', authMiddleware, roomController.kickUser);

module.exports = router;
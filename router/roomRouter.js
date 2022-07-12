const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const roomController = require('../controller/roomController');

// 사용자 맛방 전체조회
router.get('/', authMiddleware, roomController.allRoom);

//사용자 찾기 API
router.get('/findUser', authMiddleware, roomController.findUser);

//맛방 detail - 멤버 리스트
router.get('/users/:roomId', authMiddleware, roomController.detailRoomMember);

//맛방 detail - 방 정보
router.get('/:roomId', authMiddleware, roomController.detailRoomInfo);

//맛방에 맛집 저장
router.post(
    '/:roomId/storeList',
    authMiddleware,
    roomController.detailRoomSave
);

//맛방 detail - 맛집 리스트
router.get(
    '/:roomId/storeList',
    authMiddleware,
    roomController.detailRoomStoreList
);

//맛방 만들기
router.post('/', authMiddleware, roomController.writeRoom);

//맛방 초대 (공유하기)
router.post('/:roomId/invite', authMiddleware, roomController.inviteRoom);

//맛방 순서 변경
router.put('/roomset', authMiddleware, roomController.setSequenceRoom);

//맛방 수정
router.put('/:roomId', authMiddleware, roomController.rewriteRoom);

//맛방 삭제
router.delete('/:roomId', authMiddleware, roomController.deleteRoom);

//맛방에 있는 사람 강퇴하기
router.put('/:roomId/kickUser', authMiddleware, roomController.kickUser);

module.exports = router;
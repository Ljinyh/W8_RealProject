const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const storeController = require('../controller/storeController');

// 사용자의 맛방 목록 조회 (내가 소속된 맛방 별로 검색)
router.get('/', authMiddleware, storeController.allMatBang);

// 맛집 생성 (첫 기록하기)
router.post('/write', authMiddleware, storeController.createStore);

// 지도에 맛집 보여주기 (현재 위치기반 검색)
router.get('/map', authMiddleware, storeController.mapViewer);

// 맛방에 맛집 저장
router.post('/saverooms', authMiddleware, storeController.saveStore);

// 태그 필터 검색
router.post('/map', authMiddleware, storeController.tagMapViewer);

// 맛마디 상세 조회
router.get('/matmadi/:madiId', authMiddleware, storeController.detailMatmadi);
``
// 맛마디 수정
router.put('/matmadi/:madiId', authMiddleware, storeController.updateMatmadi);

// 맛마디 삭제
router.delete('/matmadi/:madiId', authMiddleware, storeController.deleteMatmadi);

// 특정 맛집의 맛태그 조회
router.get('/:storeId/tag', authMiddleware, storeController.tag);

// 특정 맛집의 추천 메뉴 조회
router.get('/:storeId/menu', authMiddleware, storeController.viewMenu);

// 맛집 상세 조회 말풍선
router.get('/:storeId', authMiddleware, storeController.detailStore);

// 특정 맛방의 맛집 태그 아이콘
router.get('/:roomId/tagicon', authMiddleware, storeController.roomTagIcon);

// 리뷰 남기기 (맛마디)
router.post('/:storeId/matmadi', authMiddleware, storeController.writeMatmadi);

// 맛마디 전체 조회
router.get('/:storeId/matmadi', authMiddleware, storeController.allMatmadi);

module.exports = router;
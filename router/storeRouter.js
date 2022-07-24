const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const storeController = require('../controller/storeController');

// 맛집 생성 (첫 기록하기)
router.post('/write', authMiddleware, storeController.createStore);

// 지도에 맛집 보여주기 (현재 위치기반 검색)
router.get('/map', authMiddleware, storeController.mapViewer);

// 맛방에 맛집 저장
router.post('/saverooms', authMiddleware, storeController.saveStore);

// 맛집 상세 조회 말풍선
router.get('/:storeId', authMiddleware, storeController.detailStore);

// 사용자의 맛방 목록 조회 (내가 소속된 맛방 별로 검색)
router.get('/', authMiddleware, storeController.allMatBang);

// 특정 맛방의 맛집 태그 아이콘
router.get('/:roomId/tagicon', authMiddleware, storeController.roomTagIcon);

// 리뷰 남기기 (맛마디)
router.post('/:storeId/matmadi', authMiddleware, storeController.writeMatmadi);

// 맛마디 전체 조회
router.get('/:storeId/matmadi', authMiddleware, storeController.allMatmadi);

// 맛마디 상세 조회
router.get('/:storeId/:madiId', authMiddleware, storeController.detailMatmadi);

// 맛마디 수정
router.put('/:madiId/matmadi', authMiddleware, storeController.updateMatmadi);

// 맛마디 수정
router.delete('/:madiId/matmadi', authMiddleware, storeController.deleteMatmadi);

// 맛마디 좋아요 토글
router.post('/:madiId/like', authMiddleware, storeController.likeMatmadi);

// 맛마디 좋아요 취소
router.delete('/:madiId/like', authMiddleware, storeController.unlikeMatmadi);

// 특정 맛집의 맛태그 조회
router.get('/:storeId/mattag', authMiddleware, storeController.mattag);

// 특정 맛집의 추천 메뉴 조회
router.get('/:storeId/menu', authMiddleware, storeController.viewMenu);

// 추천 메뉴 추가
router.post('/:storeId/menu', authMiddleware, storeController.addMenu);

// 추천 메뉴 좋아요 토글
router.post('/:storeId/menu/:menuId', authMiddleware, storeController.likeMenu);

// 추천 메뉴 좋아요 취소
router.delete(
    '/:storeId/menu/:menuId',
    authMiddleware,
    storeController.unlikeMenu
);

// 태그 필터 검색
router.post('/map', authMiddleware, storeController.tagMapViewer);

module.exports = router;

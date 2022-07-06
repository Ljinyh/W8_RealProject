const Room = require('../models/room');
const User = require('../models/user');

module.exports = {
    // 사용자 맛방 전체조회
    allRoom: async (req, res) => {
        const existRoom = await Room.find().sort({ createdAt: 'asc' }).exec();
        res.send({ result: true });
    },

    //맛방 detail - 방 정보
    detailRoomInfo: async (req, res) => {
        res.send({ result: true });
    },

    //맛방 detail - 멤버 리스트
    detailRoomMember: async (req, res) => {
        const { roomId } = req.params;
        res.send({ result: true });
    },

    //맛방 detail - 맛집 리스트
    detailRoomStoreList: async (req, res) => {
        try {
        } catch (err) {}
        res.send({ result: true });
    },

    //맛방 만들기
    writeRoom: async (req, res) => {
        try {
        } catch (err) {}
        res.send({ result: true });
    },

    //맛방 초대 (공유하기)
    inviteRoom: async (req, res) => {
        try {
        } catch (err) {}
        res.send({ result: true });
    },

    //맛방 수정
    rewriteRoom: async (req, res) => {
        try {
        } catch (err) {}
        res.send({ result: true });
    },

    //맛방 삭제
    deleteRoom: async (req, res) => {
        try {
        } catch (err) {}
        res.send({ result: true });
    },

    //맛방 순서 변경
    setSequenceRoom: async (req, res) => {
        try {
        } catch (err) {}
        res.send({ result: true });
    },
};

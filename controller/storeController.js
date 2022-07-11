const Room = require('../models/room');
const User = require('../models/user');
const Savelist = require('../models/savelist');
const Store = require('../models/store');

module.exports = {
    // 맛집 생성 (첫 기록하기), 방장의 방목록에 추가까지
    createStore: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { storeName, location, LatLon, imgURL } = res.body;
        const { roomId } = res.params;

        try {
            // 정보를 가게 DB에 저장
            const save = await Store.create({
                storeName,
                location,
                imgURL,
                LatLon,
            });

            // 방장이 보고있던 roomId를 가져와서 savelist에 저장
            await Savelist.create({
                userId: user.userId,
                storeId: save.storeId,
                roomId,
            });
            res.status(200).send({
                result: true,
            });
        } catch (err) {
            console.log(err);
            res.send({ result: false, message: '맛집 기록 실패' });
        }
    },

    // 맛방에 저장
    saveStore: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { storeId, comment } = res.body;
        const { roomId } = res.params;
        try {
            // savelist DB에 저장
            await Savelist.create({
                userId: user.userId,
                storeId: storeId,
                roomId,
                comment,
            });
            res.status(200).send({
                result: true,
            });
        } catch (err) {
            console.log(err);
            res.send({ result: false, message: '맛방에 저장 실패' });
        }
    },
};

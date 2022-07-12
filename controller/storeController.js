const Room = require('../models/room');
const User = require('../models/user');
const Savelist = require('../models/savelist');
const Store = require('../models/store');

module.exports = {

    // 맛집 생성 (첫 기록하기), 방장의 맛방에 맛집 추가까지
    createStore: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { storeName, comment, address, LatLon, imgURL } = req.body;
        const { roomId } = req.params;

        try {
            // 정보를 가게 DB에 저장
            const save = await Store.create({
                userId: user.userId,
                storeName,
                address,
                imgURL,
                LatLon,
                tag: '',
                star: '',
                price: '',
                recommendMenu: '',
            })

            // 방장이 보고있던 roomId를 가져와서 savelist에 저장
            await Savelist.create({
                userId: user.userId,
                storeId: save.storeId,
                imgURL : imgURL,
                roomId,
                comment,
            });
            res.status(200).send({
                result: true,
            });
        } catch (err) {
            console.log(err);
            res.send({ result: false, message: '맛집 기록 실패' });
        }
    },
    
};

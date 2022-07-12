const Room = require('../models/room');
const Store = require('../models/store');
const SaveList = require('../models/saveList');

module.exports = {
    //==============================================================
    //맛집 지도에 첫 기록하기
    firstMapSave: async(req, res) => {
        const { userId } = res.locals.user;
        const { roomId } = req.params;
        const {
            storeName,
            address,
            LatLon,
            comment,
            imgURL,
            tag,
            star,
            price,
        } = req.body;

        const theRoom = await Room.findById(roomId).exec();
        const theStore = await Store.findOne({ storeName: storeName }).exec();

        try {
            if (theRoom) {
                if (theStore) {
                    return res.status(400).send({
                        errorMessage: '이미 지도에 등록되어 있는 맛집입니다.',
                    });
                } else {
                    await Store.create({
                        userId,
                        storeName,
                        address,
                        LatLon,
                        createdAt: Date.now(),
                    });
                    console.log('맛집 등록 성공!');
                }

                let theStoreId = await Store.findOne({ storeName: storeName });
                const storeId = theStoreId.storeId;

                await SaveList.create({
                    userId,
                    roomId,
                    storeId,
                    comment,
                    imgURL,
                    star,
                    price,
                    tag,
                    createdAt: Date.now(),
                });

                return res.status(200).send({ msg: '맛집 등록 완료' });
            }
        } catch (err) {
            console.log(err);
            res.send({ result: false });
        }
    },
};
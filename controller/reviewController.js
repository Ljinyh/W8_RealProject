const Store = require('../models/store');
const Reviews = require('../models/matmadi');
const Like = require('../models/like');

module.exports = {
    // 유저가 작성한 맛마디 전체 불러오기
    getReviews: async(req, res) => {
        const { userId } = res.locals.user;
        const existReviews = await Reviews.find({ userId: userId });

        if (existReviews) {
            const TheReviews = existReviews.map((review) => ({
                madiId: review.madiId,
                storeId: review.storeId,
                comment: review.comment,
                star: review.star,
                imgURL: review.imgURL,
            }));

            let theMadi = [];
            let storeName = [];
            for (let i = 0; i < TheReviews.length; i++) {
                const existLike = await Like.find({ userId: userId, madiId: TheReviews[i].madiId });
                const TheStoreName = await Store.findById(
                    TheReviews[i].storeId
                );
                storeName.push(TheStoreName.storeName);
                theMadi.push(existLike.length);
            }

            const TheReview = TheReviews.map((review, idx) => ({
                madiId: review.madiId,
                storeName: storeName[idx],
                comment: review.comment,
                star: review.star,
                imgURL: review.imgURL,
                LikeNum: theMadi[idx],
            }));

            return res.status(200).send({ result: true, TheReview })
        }
    },
};
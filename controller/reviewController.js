const Store = require('../models/store');
const Reviews = require('../models/matmadi');
const Like = require('../models/like');

module.exports = {
    // 유저가 작성한 맛마디 전체 불러오기
    getReviews: async(req, res) => {
        const { userId } = res.locals.user;
        const existReviews = await Reviews.find({ userId: userId });

        try {
            if (existReviews === 0) {
                return res.status(200).send({ reuslt: [] });
            }

            if (existReviews && existReviews !== 0) {
                const TheReviews = existReviews.map((review) => ({
                    madiId: review.madiId,
                    userId: review.userId,
                    storeId: review.storeId,
                    comment: review.comment,
                    star: review.star,
                    imgURL: review.imgURL,
                }));

                let theMadi = [];
                let existStoreName = [];
                let MyLikes = [];
                for (let i = 0; i < TheReviews.length; i++) {
                    const existLike = await Like.find({ userId: userId, madiId: TheReviews[i].madiId });
                    const TheMyLike = existLike.find((e) => (e.madiId === TheReviews[i].madiId))
                    const TheStoreName = await Store.findById(
                        TheReviews[i].storeId
                    );

                    existStoreName.push(TheStoreName.storeName);
                    theMadi.push(existLike.length);
                    MyLikes.push(TheMyLike  ? true : false);
                }



                const TheReview = TheReviews.map((review, idx) => ({
                    madiId: review.madiId,
                    userId: review.userId,
                    storeName: existStoreName[idx],
                    comment: review.comment,
                    star: review.star,
                    imgURL: review.imgURL,
                    LikeNum: theMadi[idx],
                    LikeDone: MyLikes[idx],
                }));

                return res.status(200).send({ result: true, TheReview })
            }
        } catch (err) {
            console.log(err);
            res.status(400).send('error!')
        }
    },
};
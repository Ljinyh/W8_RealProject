const Store = require('../models/store');
const Review = require('../models/matmadi');
const User = require('../models/user');

module.exports = {
    //달 기록 횟수 && 나의 리뷰 총 갯수
    getAnalyze: async(req, res) => {
        const { userId } = res.locals.user;
        try {
            const MyReivews = await Review.find({ userId: userId });
            const TheDates = new Date();
            const value = TheDates.getMonth() +1
            
            const TheMonthDate = await Store.find({
                userId: userId
            });

            const saveDate = TheMonthDate.map((date) => date.createdAt.getMonth() +1)
    
            let count = 0;

            for(let i =0; i<saveDate.length; i++) {
                saveDate[i] === value ? count++ : 0
            }

                return res.status(200).send({
                    result: true,
                    monthPost: count,
                    MyReivewsNum: MyReivews.length,
                });

        } catch (err) {
            console.log(err);
            res.status(400).send({ errorMessage: 'error!' });
        }
    },

    // 먹 매치포인트
    ReviewMatch: async(req, res) => {
        const { userId } = res.locals.user;

        try {
            //전체리뷰
            const findReviews = await Review.find();
            //내 리뷰
            const MyReivews = findReviews.filter((e) => e.userId === userId);

            if (MyReivews.length === 0) {
                return res.status(200).send({ result: [] });
            }

            if (MyReivews.length !== 0) {
                const MyReivewsStore = MyReivews.map(
                    (review) => review.storeId
                );
                // 내가 없는 전체 리뷰
                const UserReviews = findReviews.filter(
                    (review) => review.userId !== userId
                );

                // 나와 맛리뷰가 겹치는 사람의 리뷰
                const CheckReivews = UserReviews.filter((review) =>
                    MyReivewsStore.includes(review.storeId)
                );

                // 나와 같은 리뷰를 쓴 사용자 정보
                const TheUsers = CheckReivews.map((user) => user.userId);

                let UserInfo = [];
                for (let i = 0; i < TheUsers.length; i++) {
                    const TheUserInfo = await User.findById(TheUsers[i]);
                    UserInfo.push({
                        userId: TheUserInfo.userId,
                        nickname: TheUserInfo.nickname,
                        faceColor: TheUserInfo.faceColor,
                        eyes: TheUserInfo.eyes,
                    });
                }

                let countArray = [];
                for (let i = 0; i < UserInfo.length; i++) {
                    let count = 0;
                    for (let j = 0; j < CheckReivews.length; j++) {
                        if (UserInfo[i].userId === CheckReivews[j].userId) {
                            count++;
                        }
                    }
                    countArray.push(count);
                }

                let result = UserInfo.map((e, idx) => ({
                    nickname: e.nickname,
                    faceColor: e.faceColor,
                    eyes: e.eyes,
                    matchCount: countArray[idx],
                }));
                result.sort((a, b) => a.matchCount - a.matchCount);
                return res.status(200).send(result);
            }
            res.status(400).send({ result: false });
        } catch (err) {
            consol.log(err);
            res.status(400).send('Error!');
        }
    },

    // 리뷰왕
    ReviewKing: async(req, res) => {
        try {
            const existReivews = await Review.find();

            const TheReview = existReivews.map((user) => user.userId);
            const rank = TheReview.reduce((accu, curr) => {
                accu[curr] = (accu[curr] || 0) + 1;
                return accu;
            }, {});

            const TheRank = Object.keys(rank).sort((a, b) => rank[b] - rank[a]);

            const FirstUser = await User.findById(TheRank[0]);

            res.status(200).send({
                result: true,
                nickname: FirstUser.nickname,
                faceColor: FirstUser.faceColor,
                eyes: FirstUser.eyes,
            });
        } catch (err) {
            console.log(err);
            res.status(400).send('Error!');
        }
    },

    // 발견왕
    PostKing: async(req, res) => {
        try {
            const existPost = await Store.find();

            const TheStore = existPost.map((user) => user.userId);

            const rank = TheStore.reduce((accu, curr) => {
                accu[curr] = (accu[curr] || 0) + 1;
                return accu;
            }, {});

            const TheRank = Object.keys(rank).sort((a, b) => rank[b] - rank[a]);

            const FirstUser = await User.findById(TheRank);
            res.status(200).send({
                result: true,
                nickname: FirstUser.nickname,
                faceColor: FirstUser.faceColor,
                eyes: FirstUser.eyes,
            });
        } catch (err) {
            console.log(err);
            res.status(400).send('Error!');
        }
    },

    // 특정 맛집 맛태그 조회
    tagRank: async(req, res) => {
        const { storeId } = req.params;
        try {
            const findStoreReview = await Review.find({ storeId: storeId });
            if (findStoreReview.length === 0) {
                return res.status(200).send({ result: [] });
            }

            const alltag = [];
            if (findStoreReview && findStoreReview.length !== 0) {
                for (i = 0; i < findStoreReview.length; i++) {
                    alltag.push(
                        ...findStoreReview[i].tagMenu,
                        ...findStoreReview[i].tagPoint,
                        ...findStoreReview[i].tagTasty
                    );
                }

                const Tags = alltag.reduce((accu, curr) => {
                    accu[curr] = (accu[curr] || 0) + 1;
                    return accu;
                }, {});

                const TheTagRank = Object.keys(Tags).sort(
                    (a, b) => Tags[b] - Tags[a]
                );

                return res.status(200).send({ result: true, Tag: Tags });
            }
            res.status(400).send({ result: false });
        } catch (err) {
            console.log(err);
            res.status(400).send('Error!');
        }
    },

    // 나의 최애 음식
    MyFavorite: async(req, res) => {
        const { userId } = res.locals.user;

        try {
            const MyReviews = await Review.find({ userId: userId });

            if (MyReviews.length === 0) {
                return res.status(200).send({ result: [] });
            }

            if (MyReviews || MyReviews.length !== 0) {
                const TheTasty = MyReviews.map((tag) => tag.tagTasty);
                const THePoint = MyReviews.map((tag) => tag.tagPoint);

                const TheTags = [].concat(TheTasty, THePoint);
                const tagArray = TheTags.reduce((acc, cur) => acc.concat(cur));
                const Tags = tagArray.reduce((accu, curr) => {
                    accu[curr] = (accu[curr] || 0) + 1;
                    return accu;
                }, {});

                return res.status(200).send({ result: true, Tag: Tags });
            }
            res.status(400).send({ result: false });
        } catch (err) {
            console.log(err);
            res.status(400).send('Error!');
        }
    },
};
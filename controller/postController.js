const Exhibit = require('../models/exhibit');
const User = require('../models/user');

module.exports = {
    // 메인 화면 전체 게시글 조회 API
    allPost: async (req, res) => {
        const existPost = await Exhibit.find().exec();
        res.send({
            result: 'success',
            posts: existPost,
        });
    },

    // 전시회 상세 조회 - 소개
    introPost: async (req, res) => {
        const { postId } = req.params;
        try {
            const existPost = await Exhibit.findById(postId);
            const postUser = await User.findById(existPost.userId); //게시글 작성자의 유저 정보 불러오기
            res.status(200).json({
                result: 'success',
                postIntro: {
                    title: existPost.title,
                    subtitle: existPost.subtitle,
                    thumbnailImg: existPost.thumbnailImg,
                    content: existPost.content,
                    imgURL: existPost.imgURL,
                    nickName: postUser.nickName,
                    userInfo: postUser.userInfo,
                },
            });
        } catch (err) {
            res.status(400).json({ result: '상세 게시글 가져오기 실패', err });
        }
    },

    // 전시회 상세 조회 - 전시 안내
    infoPost: async (req, res) => {
        const { postId } = req.params;
        try {
            const existPost = await Exhibit.findById(postId);
            const postUser = await User.findById(existPost.userId); //게시글 작성자의 유저 정보 불러오기
            res.status(200).json({
                result: 'success',
                postInfo: {
                    title: existPost.title,
                    subtitle: existPost.subtitle,
                    thumbnailImg: existPost.thumbnailImg,
                    startDate: existPost.startDate,
                    endDate: existPost.endDate,
                    LatLng: existPost.LatLng,
                    address: existPost.address,
                    phoneNum: existPost.phoneNum,
                    openingHours: existPost.openingHours,
                    siteURL: existPost.siteURL,
                    subInfo: existPost.subInfo,
                },
            });
        } catch (err) {
            res.status(400).json({ result: '상세 게시글 가져오기 실패', err });
        }
    },

    // 전시회 게시글 작성
    writePost: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        console.log(user.userId);
        const {
            title,
            subtitle,
            thumbnailImg,
            content,
            imgURL,
            startDate,
            endDate,
            LatLng,
            address,
            phoneNum,
            openingHours,
            siteURL,
            subInfo,
            tag,
        } = req.body;

        try {
            await Exhibit.create({
                userId: user.userId,
                title,
                subtitle,
                thumbnailImg,
                content,
                imgURL,
                startDate,
                endDate,
                LatLng,
                address,
                phoneNum,
                openingHours,
                siteURL,
                subInfo,
                tag,
            });
            res.status(201).json({ msg: '게시글 작성 완료' });
        } catch (err) {
            console.log(err);
            res.status(400).json({ errorMessage: '게시글 작성 실패.' });
        }
    },

    // 전시회 게시글 수정
    rewritePost: async (req, res) => {
        const { user } = res.locals; // JWT 인증 정보
        const { postId } = req.params;
        const {
            title,
            subtitle,
            thumbnailImg,
            content,
            imgURL,
            startDate,
            endDate,
            LatLng,
            address,
            phoneNum,
            openingHours,
            siteURL,
            subInfo,
            tag,
        } = req.body;

        try {
            const existedPost = await Exhibit.findById({ _id: postId }); // DB에서 postId가 같은 데이터 찾기
            // 로그인 정보와 게시글 작성자가 같은지 확인
            if (user.userId !== existedPost.userId) {
                res.status(400).json({
                    result: false,
                    message: '사용자가 작성한 게시글이 아닙니다.',
                });
            } else {
                await Exhibit.findByIdAndUpdate(
                    { _id: postId }, //해당 postId 찾아서 내용 수정
                    {
                        $set: {
                            title,
                            subtitle,
                            thumbnailImg,
                            content,
                            imgURL,
                            startDate,
                            endDate,
                            LatLng,
                            address,
                            phoneNum,
                            openingHours,
                            siteURL,
                            subInfo,
                            tag,
                        },
                    }
                );
                res.status(201).json({
                    result: 'success',
                    msg: '게시글 수정 완료',
                });
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({ errorMessage: '게시글 수정 실패' });
        }
    },

    deletePost: async (req, res) => {
        try {
            const { user } = res.locals; // JWT 인증 정보
            const { postId } = req.params;

            const existedPost = await Exhibit.findById(postId); // DB에서 postId가 같은 데이터 찾기
            if (user.userId !== existedPost.userId) {
                // 로그인 정보와 게시글 작성자가 같은지 확인
                res.json({
                    result: false,
                    errMessage: '사용자가 작성한 게시글이 아닙니다.',
                });
            } else {
                //   await Like.findByIdAndDelete(postId); //해당 게시물 좋아요 DB 삭제 // 좋아요 미구현
                await Exhibit.findByIdAndDelete(postId);
                res.status(200).json({
                    result: true,
                    message: '게시글 삭제 완료',
                });
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({ result: false });
        }
    },
};

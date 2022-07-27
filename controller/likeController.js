 const Like = require('../models/like');

 module.exports = {
     // 맛마디 좋아요 토글
     likeMatmadi: async(req, res) => {
         const { userId } = res.locals.user;
         const { madiId } = req.params;
         try {
             const likeDone = await Like.findOne({ userId, madiId });
             if (likeDone) {
                 return res.status(400).send({
                     result: false,
                     message: '이미 좋아요를 눌렀습니다.',
                 });
             }
             await Like.create({ userId: userId, madiId: madiId });

             // 해당 게시글 좋아요 개수 다시 출력해주기 (갱신)
             const likes = await Like.find({ madiId });
             const likeNum = likes.length;
             return res
                 .status(200)
                 .send({ result: true, likeNum, message: '좋아요 완료' });
         } catch (err) {
             console.log(err);
             res.status(400).send({ result: false, message: '좋아요 실패' });
         }
     },
     // 맛마디 좋아요 취소
     unlikeMatmadi: async(req, res) => {
         const { userId } = res.locals.user;
         const { madiId } = req.params;
         try {
             // 사용자가 좋아요를 이미 취소했는지 확인하기
             const cancleLike = await Like.findOne({ userId, madiId });
             if (!cancleLike) {
                 return res.status(400).send({
                     result: false,
                     message: '이미 좋아요를 취소했습니다.',
                 });
             }
             // 사용자의 좋아요 데이터  삭제
             await Like.deleteOne({ userId, madiId });
             return res
                 .status(200)
                 .send({ result: true, message: '좋아요 취소 완료' });
         } catch (err) {
             console.log(err);
             res.status(400).send({
                 result: false,
                 message: '좋아요 취소 실패',
             });
         }
     },

     // 태그 좋아요 토글
     likeMenu: async(req, res) => {
         const { userId } = res.locals.user;
         const { menuId } = req.params;
         try {
             const likeDone = await Like.findOne({ userId, menuId });
             if (likeDone) {
                 return res.status(400).send({
                     result: false,
                     message: '이미 좋아요를 눌렀습니다.',
                 });
             }
             await Like.create({ userId, menuId });
             // 해당 게시글 좋아요 개수 다시 출력해주기 (갱신)
             const likes = await Like.find({ menuId });
             const likeNum = likes.length;

             return res
                 .status(200)
                 .send({ result: true, likeNum, message: '좋아요 완료' });
         } catch (err) {
             console.log(err);
             res.status(400).send({ result: false, message: '좋아요 실패' });
         }
     },
     // 태그 좋아요 취소
     unlikeMenu: async(req, res) => {
         const { userId } = res.locals.user;
         const { menuId } = req.params;
         try {
             const cancleLike = await Like.findOne({ userId, menuId });
             if (!cancleLike) {
                 return res.status(400).send({
                     result: false,
                     message: '이미 좋아요를 취소했습니다.',
                 });
             }
             await Like.findOneAndDelete({ userId, menuId });
             return res
                 .status(200)
                 .send({ result: true, message: '좋아요 취소 완료' });
         } catch (err) {
             console.log(err);
             res.status(400).send({
                 result: false,
                 message: '좋아요 취소 실패',
             });
         }
     },
 }
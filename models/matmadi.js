const mongoose = require('mongoose');

const MatmadiSchema = new mongoose.Schema({
    storeId: String,
    userId: [String],
    comment: {type : String, required : true},
    star: String,
    imgURL: [String],
    createdAt: Date,
    tagMenu : String, 
    tagTasty : String,
    tagPoint : String, 
    ratingTasty : Number, 
    ratingPrice : Number, 
    ratingService: Number,
});
MatmadiSchema.virtual('madiId').get(function() {
    return this._id.toHexString();
});
MatmadiSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Matmadi', MatmadiSchema);
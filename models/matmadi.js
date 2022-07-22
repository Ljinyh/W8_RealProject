const mongoose = require('mongoose');

const MatmadiSchema = new mongoose.Schema({
    storeId: String,
    userId: [String],
    comment: {type : String, required : true},
    star: String,
    imgURL: [String],
    createdAt: Date,
});
MatmadiSchema.virtual('madiId').get(function() {
    return this._id.toHexString();
});
MatmadiSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Matmadi', MatmadiSchema);
const mongoose = require('mongoose');

const MatmadiSchema = new mongoose.Schema({
    storeId: String,
    userId: [String],
    comment: {type : String, required : true},
    star: String,
    imgURL: [String],
    createdAt: Date,
});
RoomSchema.virtual('madiId').get(function() {
    return this._id.toHexString();
});
RoomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Matmadi', MatmadiSchema);
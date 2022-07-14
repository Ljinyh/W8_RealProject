const mongoose = require('mongoose');

const SaveListSchema = new mongoose.Schema({
    userId: String,
    roomId: String,
    storeId: String,
    comment: String,
    imgURL: [String],
    star: String,
    price: String,
    tag: [String],
    recommendMenu : [String],
    createdAt: Date,
});
SaveListSchema.virtual('saveId').get(function() {
    return this._id.toHexString();
});
SaveListSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('saveList', SaveListSchema);
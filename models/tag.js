const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    storeId: String,
    tagMenu: String,
    tagTasty: String,
    tagPoing: String,
});
TagSchema.virtual('tagId').get(function () {
    return this._id.toHexString();
});
TagSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Like', TagSchema);
const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    storeId: String,
    tagMenu: String,
    tagTasty: String,
    tagPoint: String,
    category: String,
});
TagSchema.virtual('menuId').get(function () {
    return this._id.toHexString();
});
TagSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Tag', TagSchema);

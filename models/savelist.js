const mongoose = require('mongoose');

const SavelistSchema = new mongoose.Schema({
    roomId: String,
    storeId: String,
});
SavelistSchema.virtual('saveId').get(function () {
    return this._id.toHexString();
});
SavelistSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('savelist', SavelistSchema);

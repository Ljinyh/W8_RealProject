const mongoose = require('mongoose');

const SaveListSchema = new mongoose.Schema({
    userId: String,
    roomId: String,
    storeId: String,
    createdAt: Date,
});
SaveListSchema.virtual('saveId').get(function() {
    return this._id.toHexString();
});
SaveListSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('saveList', SaveListSchema);
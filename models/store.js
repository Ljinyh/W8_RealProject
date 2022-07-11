const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    userId: String,
    storeName: String,
    address: String,
    LatLon: String,
    star: String,
    tag: String,
    userId: String,
    createdAt: Date,
});
StoreSchema.virtual('storeId').get(function() {
    return this._id.toHexString();
});
StoreSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('store', StoreSchema);
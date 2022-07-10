const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    storeName: String,
    subtitle : String,
    address: String,
    LatLot: String,
    star: String,
    tag: String,
    userId: String,
});
StoreSchema.virtual('storeId').get(function () {
    return this._id.toHexString();
});
StoreSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('store', StoreSchema);
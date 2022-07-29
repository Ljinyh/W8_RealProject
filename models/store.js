const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    userId: String,
    storeName: String,
    address: String,
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true },
    }, 
    //latitude 위도, longitude 경도
    mainTag: [String],
    mainComment: String,
    createdAt: Date,
    phone : String,
    placeURL : String,
});
StoreSchema.virtual('storeId').get(function () {
    return this._id.toHexString();
});
StoreSchema.set('toJSON', { virtuals: true });

StoreSchema.index({location:'2dsphere'}); // 경도위도 인덱스를 2차원 구형(sphere)으로 설정

module.exports = mongoose.model('store', StoreSchema);

const mongoose = require('mongoose');

const ExhibitSchema = new mongoose.Schema({
    userId: String,
    thumbnailImg: String,
    title: String,
    subtitle: String,
    content: String,
    imgURL: String,
    startDate: String,
    endDate: String,
    LatLng: String,
    address: String,
    phoneNum: String,
    openingHours: String,
    subInfo: String,
    tag: String,
});

ExhibitSchema.virtual('postId').get(function () {
    return this._id.toHexString();
});
ExhibitSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Exhibit', ExhibitSchema);

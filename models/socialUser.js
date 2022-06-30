const mongoose = require('mongoose');

const SocialUserSchema = new mongoose.Schema({
    snsId: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    nickName: {
        type: String,
        required: true,
    },
    userImageURL: {
        type: String,
    },
    provider: {
        type: String,
        required: true,
    },
});

SocialUserSchema.virtual('socialId').get(function() {
    return this._id.toHexString();
});
SocialUserSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('SocialUsers', SocialUserSchema);
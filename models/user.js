const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    nickname: String,
    email: String,
    phoneNum: String,
    password: String,
    faceColor: String,
    eyes: String,
    snsId: String,
    provider: String,
}, { timestamps: true });

UserSchema.virtual('userId').get(function() {
    return this._id.toHexString();
});
UserSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);

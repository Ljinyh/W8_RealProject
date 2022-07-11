const mongoose = require('mongoose');

const UserRoomSchema = new mongoose.Schema({
    userId: String,
    roomSeq: [String],
}, { timestamps: true });

UserRoomSchema.virtual('userRoomId').get(function() {
    return this._id.toHexString();
});
UserRoomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('UsersRoom', UserRoomSchema);
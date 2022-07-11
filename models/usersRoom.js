const mongoose = require('mongoose');

const UsersRoomSchema = new mongoose.Schema({
    userId: String,
    roomSeq : [String],
});
UsersRoomSchema.virtual('usersRoomId').get(function () {
    return this._id.toHexString();
});
UsersRoomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('usersRoom', UsersRoomSchema);
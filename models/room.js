const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomName: String,
    status: String,
    ownerId: String,
    guestId: String,
    emoji: String,
    roomCode: String,
});
RoomSchema.virtual('roomId').get(function () {
    return this._id.toHexString();
});
RoomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('room', RoomSchema);

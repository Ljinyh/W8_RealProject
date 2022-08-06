const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomName: { type: String, required: true },
    ownerId: String,
    guestId: [String],
    emoji: String,
    roomCode: String,
    createdAt: Date,
});
RoomSchema.virtual('roomId').get(function () {
    return this._id.toHexString();
});
RoomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Room', RoomSchema);

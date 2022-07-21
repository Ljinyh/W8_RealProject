const mongoose = require('mongoose');

const alertSchema = mongoose.Schema({
    guestName: String,
    senderName: String,
    roomName: String,
    createdAt: String,
});

alertSchema.virtual('alertId').get(function() {
    return this._id.toHexString();
});

alertSchema.set('toJSON', {
    virtual: true,
});

module.exports = mongoose.model('Alert', alertSchema);
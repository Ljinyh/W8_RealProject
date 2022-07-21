const mongoose = require('mongoose');

const alertSchema = mongoose.Schema({
    userId: String,
    senderName: String,
    roomName: String,
    type: String,
    createdAt: String,
});

alertSchema.virtual('alertId').get(function() {
    return this._id.toHexString();
});

alertSchema.set('toJSON', {
    virtual: true,
});

module.exports = mongoose.model('Alert', alertSchema);
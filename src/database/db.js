const mongoose = require('mongoose');
const Mongo = require('../config/mongodb.json');

function connectDB() {
    return mongoose.connect(Mongo.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

module.exports = connectDB;
const mongoose = require('mongoose');
const Mongo = require('../config/mongodb.json');
require("dotenv").config();

function connectDB() {
    return mongoose.connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

module.exports = connectDB;
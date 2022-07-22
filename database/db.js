const mongoose = require('mongoose');
require("dotenv").config();

function connectDB() {
    return mongoose.connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

module.exports = connectDB;
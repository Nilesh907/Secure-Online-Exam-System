const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
    student: String,
    paper: String,
    time: { type: Date, default: Date.now },
    ip: String
});

module.exports = mongoose.model("AccessLog", logSchema);
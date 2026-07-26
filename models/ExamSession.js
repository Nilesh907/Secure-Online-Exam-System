const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const examSessionSchema = new Schema({

    student: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    paper: {
        type: Schema.Types.ObjectId,
        ref: "Paper"
    },

    token: String,

    tokenExpiry: Date,

    tokenUsed: {
        type: Boolean,
        default: false
    },

    examStartTime: Date,

    isSubmitted: {
        type: Boolean,
        default: false
    },

    tabSwitchCount: {
        type: Number,
        default: 0
    },

    riskScore: {
        type: Number,
        default: 0
    },

    riskLevel: {
        type: String,
        default: "LOW"
    },

    lastPing: {
        type: Date,
        default: Date.now
    },

    isSuspended: {
        type: Boolean,
        default: false
    },

    violationReason: {
        type: String,
        default: null
    },

    sessionId: {
        type: String,
        default: null
    },

    deviceId: {
    type: String,
    default: null
},

});

module.exports = mongoose.model(
    "ExamSession",
    examSessionSchema
);
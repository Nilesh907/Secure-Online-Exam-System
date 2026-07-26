const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuditLogSchema = new Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    paper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Paper"
    },

    action: {
        type: String,
        required: true
    },

    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    "AuditLog",
    AuditLogSchema
);
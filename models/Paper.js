const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaperSchema = new Schema({
  subject: {
    type: String,
    required: true
  },

  department: {
    type: String,
    required: true
  },

  // NEW FIELD
  classification: {
    type: String,
    enum: [
      "PUBLIC",
      "INTERNAL",
      "CONFIDENTIAL",
      "EXAM_CONFIDENTIAL"
    ],
    default: "EXAM_CONFIDENTIAL"
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  reviewComment: {
    type: String,
    default: ""
  },

  paperKey: {
    type: String,
    required: true
  },

  watermarkText: {
    type: String
  },

  
  startTime:{
    type:Date
  },

  endTime:{
    type:Date
  },

  status: {
    type: String,
    enum: [
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "NEEDS_CORRECTION",
    "SCHEDULED",
    "ACTIVE",
    "CLOSED"
  ],
  default: "DRAFT"
  },

  encryptedFilePath: {
    type: String,
    required: true
  },

  hash: {
    type: String,
    required: true
  },

  fileIV: {
    type: String,
    required: true
  },

  fileVersions: [
  {
    path: String,
    uploadedAt: Date,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  }
],

  authTag: {
    type: String,
    required: true
  },

  lastViewedAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });


const Paper = mongoose.model("Paper", PaperSchema, "paper");

module.exports = Paper;
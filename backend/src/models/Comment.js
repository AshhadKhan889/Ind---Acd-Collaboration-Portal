const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "opportunityModel",
    },
    opportunityModel: {
      type: String,
      required: true,
      enum: ["Job", "Project", "Internship"],
    },
    comment: { type: String, required: true },
    commentType: {
      type: String,
      enum: ["General", "Feedback", "Query"],
      default: "General",
    },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    attachments: [String],
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Comment", commentSchema);

// models/applicationModel.js
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    opportunityType: {
      type: String,
      enum: ["job", "project", "internship"],
      required: true,
    },
    note: { type: String },
    resumeUrl: { type: String }, // Deprecated - kept for backward compatibility
    resumeFilePath: { type: String }, // Path to uploaded resume file

    // ✅ Job-specific fields
    positionAppliedFor: { type: String },
    expectedSalary: { type: Number },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior", "Executive"],
    },

    // ✅ Internship-specific fields
    educationLevel: { type: String },
    university: { type: String },
    graduationDate: { type: Date },
    internshipDuration: { type: String },
    learningObjectives: { type: String },

    // ✅ Project-specific fields
    projectTitle: { type: String },
    projectType: { type: String },
    areaOfInterest: { type: String },
    proposedContribution: { type: String },
    motivation: { type: String },

    // ✅ Common fields
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
      default: "Pending",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

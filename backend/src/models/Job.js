const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    organization: { type: String, required: true },
    jobTitle: { type: String, required: true },
    jobDescription: { type: String, required: true },
    keywords: [String],

    targetCandidates: { type: String },
    jobType: {
      type: String,
      enum: ["FULL-TIME", "PART-TIME", "CONTRACT", "TEMPORARY"],
    },
    experienceLevel: {
      type: String,
      enum: ["ENTRY LEVEL", "MID LEVEL", "SENIOR LEVEL", "EXECUTIVE LEVEL"],
    },
    expectedStartDate: { type: Date },
    applicationDeadline: { type: Date },
    requiredSkills: [String],
    educationRequirements: [String],
    supportingDocuments: [{ type: String }],

    minSalary: { type: Number },
    maxSalary: { type: Number },
    workLocation: { type: String, enum: ["REMOTE", "HYBRID", "ON-SITE"] },
    officeLocation: { type: String },
    employeeBenefits: [String],

    createdAt: { type: Date, default: Date.now },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    // 🔑 new field
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Job", jobSchema);

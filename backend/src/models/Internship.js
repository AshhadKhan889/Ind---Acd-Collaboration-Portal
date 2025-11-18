const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
  organization: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },

  internshipType: {
    type: String,
    enum: ["SUMMER", "FALL", "SPRING", "YEAR-ROUND"],
    required: true,
  },

  targetMajors: [{ type: String }],
  keywords: [{ type: String }],
  requiredSkills: [{ type: String }],
  educationRequirements: [{ type: String }],

  startDate: { type: Date },
  endDate: { type: Date },
  applicationDeadline: { type: Date },
  stipend: {
    min: { type: Number },
    max: { type: Number },
  },
  workLocation: {
    type: String,
    enum: ["REMOTE", "HYBRID", "ON-SITE"],
    default: "HYBRID",
  },
  officeLocation: { type: String },
  benefits: [{ type: String }],

  supportingDocuments: [{ type: String }],

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
});

module.exports = mongoose.model("Internship", InternshipSchema);

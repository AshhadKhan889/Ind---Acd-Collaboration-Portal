const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  organization: { type: String, required: true },
  projectTitle: { type: String, required: true },
  projectDescription: { type: String, required: true },
  projectType: { type: String },
  projectDomain: { type: String },

  targetCollaborators: { type: String },
  keywords: [String],
  requiredSkills: [String],

  timeline: {
    startDate: { type: Date },
    endDate: { type: Date },
    applicationDeadline: { type: Date },
  },

  budget: {
    currency: { type: String, default: "USD" },
    amount: { type: Number },
  },
  teamSize: { type: Number },

  collaborationPreferences: {
    remoteAllowed: { type: Boolean, default: false },
    requiresNDA: { type: Boolean, default: false },
    openForStudents: { type: Boolean, default: false },
    openForProfessionals: { type: Boolean, default: false },
  },

  supportingDocuments: [String],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  createdAt: { type: Date, default: Date.now },
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

module.exports = mongoose.model("Project", projectSchema);

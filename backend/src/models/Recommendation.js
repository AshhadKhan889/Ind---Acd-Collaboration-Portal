const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema({
  recommendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recommendedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "type", // dynamically points to Job, Project, or Internship
  },
  type: { type: String, enum: ["Job", "Project", "Internship"], required: true },
  note: { type: String },
  notInterested: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Recommendation", RecommendationSchema);

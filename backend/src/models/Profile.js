const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Personal Info
  gender: { type: String, enum: ["Male", "Female"], required: true },
  dateOfBirth: {
    month: { type: String, required: true },
    year: { type: String, required: true },
  },
  postalAddress: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  cellPhone: { type: String, required: true },

  // Professional Info
  currentOrganization: { type: String, required: true },
  professionalSummary: { type: String, required: true },
  areaOfExpertise: { type: String, required: true },
  skills: [{ type: String }],

  // Academic Qualification
  academicQualification: {
    degree: { type: String, required: true },
    institute: { type: String, required: true },
    country: { type: String, required: true },
    cgpa: { type: String, required: true },
    yearOfCompletion: { type: String, required: true },
  }
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);

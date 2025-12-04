const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
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
    },

    // Documents (CV, Transcript, etc.)
    documents: [
      {
        name: { type: String, required: true }, // e.g., "CV", "Transcript"
        fileName: { type: String, required: true }, // Original filename
        filePath: { type: String, required: true }, // Path in uploads folder
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Student Progress Tracking for Accepted Applications
    progressTracking: [
      {
        applicationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Application",
          required: true,
        },
        projectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
          required: true,
        },
        projectTitle: { type: String, required: true },
        progressUpdates: [
          {
            update: { type: String, required: true }, // Progress description
            percentage: { type: Number, min: 0, max: 100, default: 0 }, // Progress percentage
            updatedAt: { type: Date, default: Date.now },
          },
        ],
        currentStatus: {
          type: String,
          enum: ["In Progress", "On Hold", "Completed", "Not Started"],
          default: "Not Started",
        },
        submissionDocument: {
          fileName: { type: String },
          originalFileName: { type: String },
          filePath: { type: String },
          uploadedAt: { type: Date },
        },
        remarks: [
          {
            remark: { type: String, required: true },
            addedBy: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            addedByName: { type: String, required: true },
            addedAt: { type: Date, default: Date.now },
            replies: [
              {
                reply: { type: String, required: true },
                repliedBy: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: true,
                },
                repliedByName: { type: String, required: true },
                repliedAt: { type: Date, default: Date.now },
              },
            ],
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Profile", profileSchema);

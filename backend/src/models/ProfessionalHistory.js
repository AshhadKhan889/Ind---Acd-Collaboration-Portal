const mongoose = require("mongoose");

const professionalHistorySchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model(
  "ProfessionalHistory",
  professionalHistorySchema
);

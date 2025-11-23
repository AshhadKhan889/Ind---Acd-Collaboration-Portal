const mongoose = require("mongoose");

const restrictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // affected user
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // admin/mod
    type: { type: String, enum: ["suspend", "role", "limit"], required: true },
    role: { type: String },
    limit: { type: String },
    reason: { type: String, required: true },
    email: { type: String }, // optional denormalized snapshot
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Restriction", restrictionSchema);

const mongoose = require("mongoose");

const kycRequestSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },

    documentType: {
      type: String,
      enum: ["PAN", "AADHAAR"],
      default: "PAN",
    },

    documentImagePath: { type: String, required: true },
    selfieImagePath: { type: String, required: true },

    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },

    aiResult: {
      riskScore: { type: Number, default: null },
      ocrText: { type: String, default: "" },
      faceVerified: { type: Boolean, default: null },
      faceDistance: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KycRequest", kycRequestSchema);

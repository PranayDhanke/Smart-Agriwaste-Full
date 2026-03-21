import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
  {
    reporterId: { type: String, required: true, index: true },
    reporterRole: {
      type: String,
      enum: ["buyer", "farmer", "admin"],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["buyer", "farmer", "waste"],
      required: true,
      index: true,
    },
    targetId: { type: String, required: true, index: true },
    reason: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
      index: true,
    },
    resolutionNote: { type: String, default: "", trim: true },
    reviewedBy: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Report", reportSchema);

import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: String,
    message: String,
    read: { type: Boolean, default: false },
    type: String,
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);

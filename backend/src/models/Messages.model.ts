import mongoose, { Schema } from "mongoose";

const chatModel = new Schema(
  {
    message: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Messages", chatModel);

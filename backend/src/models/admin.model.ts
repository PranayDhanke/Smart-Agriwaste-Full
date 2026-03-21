import mongoose, { Schema } from "mongoose";

const AdminAccountSchema = new Schema(
  {
    adminId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("AdminAccount", AdminAccountSchema);

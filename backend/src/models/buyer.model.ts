import mongoose, { Schema } from "mongoose";

const BuyerAccountSchema = new Schema(
  {
    buyerId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    aadharnumber: { type: String, required: true },

    state: { type: String, required: true },
    district: { type: String, required: true },
    taluka: { type: String },
    village: { type: String, required: true },
    houseBuildingName: { type: String, required: true },
    roadarealandmarkName: { type: String, required: true },

    aadharUrl: { type: String, required: true },
    wallet: { type: Number, default: 0 },
    coordinates: {
      lat: { type: String },
      long: { type: String },
    },
  },
  { timestamps: true },
);

export default mongoose.model("BuyerAccount", BuyerAccountSchema);

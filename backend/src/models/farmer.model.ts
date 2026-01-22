import mongoose, { Schema } from "mongoose";

const FarmerAccountSchema = new Schema(
  {
    farmerId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    aadharnumber: { type: String, required: true },

    // Address
    state: { type: String, required: true },
    district: { type: String, required: true },
    taluka: { type: String },
    village: { type: String, required: true },
    houseBuildingName: { type: String, required: true },
    roadarealandmarkName: { type: String, required: true },

    // File URLs
    aadharUrl: { type: String, required: true },
    farmDocUrl: { type: String, required: true },

    // Farm
    farmNumber: { type: String, required: true },
    farmArea: { type: String, required: true },
    farmUnit: { type: String, enum: ["hectare", "acre"], required: true },
    wallet: { type: Number, default: 0 },

    coordinates: {
      lat: { type: String },
      long: { type: String },
    },
  },
  { timestamps: true },
);

export default mongoose.model("FarmerAccount", FarmerAccountSchema);

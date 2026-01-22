import mongoose from "mongoose";

const translatedStringSchema = {
  en: { type: String, required: true },
  hi: { type: String, required: true },
  mr: { type: String, required: true },
};

const wasteSchema = new mongoose.Schema({
  title: translatedStringSchema,
  wasteType: { type: String, required: true },
  description: translatedStringSchema,
  wasteProduct: { type: String, required: true },
  wasteCategory: { type: String, required: true },
  quantity: { type: Number, required: true },
  moisture: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  seller: {
    farmerId: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  address: {
    houseBuildingName: { type: String, required: true },
    roadarealandmarkName: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    taluka: { type: String, required: true },
    village: { type: String, required: true },
  },
  unit: { type: String, required: true },
  isActive: { type: Boolean, default: true, index: true },
});

export default mongoose.model("Waste", wasteSchema);

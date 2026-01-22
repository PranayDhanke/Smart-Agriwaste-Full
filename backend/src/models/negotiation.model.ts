import mongoose, { Schema } from "mongoose";

const translatedStringSchema = {
  en: { type: String, required: true },
  hi: { type: String, required: true },
  mr: { type: String, required: true },
};

const NegotiationSchema = new Schema(
  {
    buyerId: { type: String, required: true },
    buyerName: { type: String, required: true },
    farmerId: { type: String, required: true },
    item: {
      prodId: { type: String, required: true },
      title: translatedStringSchema,
      wasteType: { type: String, required: true },
      wasteProduct: { type: String, required: true },
      moisture: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      unit: { type: String, required: true },
      description: translatedStringSchema,
      image: { type: String, required: true },
      sellerInfo: {
        seller: {
          farmerId: { type: String, required: true },
          farmerName: { type: String, required: true },
        },
        address: {
          houseBuildingName: { type: String, required: true },
          roadarealandmarkName: { type: String, required: true },
          state: { type: String, required: true },
          district: { type: String, required: true },
          taluka: { type: String, required: true },
          village: { type: String, required: true },
        },
      },
    },
    negotiatedPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Negotiation", NegotiationSchema);

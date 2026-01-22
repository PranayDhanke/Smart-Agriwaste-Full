import mongoose, { Schema } from "mongoose";

const translatedStringSchema = {
  en: { type: String, required: true },
  hi: { type: String, required: true },
  mr: { type: String, required: true },
};

const OrderSchema = new Schema(
  {
    buyerId: { type: String, required: true },
    hasPayment: { type: Boolean, required: true, default: false },
    isDelivered: { type: Boolean, required: true, default: false },
    farmerId: { type: String, required: true },
    isOutForDelivery: { type: Boolean, required: true, default: false },
    totalAmount: { type: Number, required: true },
    deliveryMode: { type: String, required: true },
    paymentId: { type: String, required: false },
    buyerInfo: {
      buyerMobile: { type: String, required: true },
      buyerName: { type: String, required: true },
      address: {
        houseBuildingName: { type: String, required: true },
        roadarealandmarkName: { type: String, required: true },
        state: { type: String, required: true },
        district: { type: String, required: true },
        taluka: { type: String, required: true },
        village: { type: String, required: true },
      },
    },
    items: [
      {
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
    ],
    status: {
      type: String,
      enum: ["pending", "confirmed" ,"cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", OrderSchema);

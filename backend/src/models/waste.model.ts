import mongoose from "mongoose";

const translatedStringSchema = {
  en: { type: String },
  hi: { type: String },
  mr: { type: String },
};

const wasteSchema = new mongoose.Schema(
  {
    title: {
      type: translatedStringSchema,
      required: true,
    },

    description: {
      type: translatedStringSchema,
    },

    wasteType: {
      type: String,
      required: true,
      index: true,
    },

    wasteProduct: {
      type: String,
      required: true,
      index: true,
    },

    wasteCategory: {
      type: String,
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    moisture: {
      type: String,
      enum: ["dry", "semiwet", "wet"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    unit: {
      type: String,
      enum: ["kg", "gram", "ton"],
      required: true,
    },

    seller: {
      farmerId: {
        type: String,
        required: true,
        index: true,
      },
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },

    address: {
      houseBuildingName: {
        type: String,
        required: true,
      },
      roadarealandmarkName: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      taluka: {
        type: String,
        required: true,
      },
      village: {
        type: String,
        required: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Waste", wasteSchema);

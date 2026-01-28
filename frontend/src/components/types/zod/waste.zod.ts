import { z } from "zod";

export const wasteFormSchema = z.object({
  title: z.string().min(1, "Title is required"),

  wasteType: z
    .enum(["crop", "fruit", "vegetable"])
    .refine(Boolean, { message: "Waste type is required" }),

  wasteCategory: z.string().min(1, "Waste category is required"),

  wasteProduct: z.string().min(1, "Waste product is required"),

  description: z.string().optional(),

  quantity: z.number()
    .min(1, "Quantity must be greater than 0"),

  moisture: z
    .enum(["dry", "semiwet", "wet"])
    .refine(Boolean, { message: "Moisture is required" }),

  price: z.number()
    .min(1, "Price must be greater than 0"),

  unit: z
    .enum(["kg", "ton", "gram"])
    .refine(Boolean, { message: "Unit is required" }),
});

export type wasteFormDataType = z.infer<typeof wasteFormSchema>;

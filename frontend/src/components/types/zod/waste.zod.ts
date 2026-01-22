import { z } from "zod";

export const wasteFormSchema = z.object({
  title: z.string().min(1, "title is required"),

  wasteType: z
    .enum(["crop", "fruit", "vegetable", ""])
    .refine((v) => v !== "", { message: "waste type is required" }),

  wasteCategory: z.string().min(1, "waste Category is required"),

  wasteProduct: z.string().min(1, "waste product is required"),

  description: z.string().min(1, "description is required"),

  quantity: z.coerce.number().int().min(1, "quantity is required"),

  moisture: z.string().min(1, "moisture is required"),

  price: z.coerce.number().int().min(1, "price is required"),


  unit: z
    .enum(["kg", "ton", "gram", ""])
    .refine((v) => v !== "", { message: "unit is required" }),
});

export type wasteFormDataType = z.infer<typeof wasteFormSchema>;

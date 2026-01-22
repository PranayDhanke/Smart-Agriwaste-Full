import z from "zod";

/**
 * Process Form Validation Schema
 * Compatible with React Hook Form + Zod Resolver
 */
export const processSchema = z.object({
  // Waste Type (crop | vegetable | fruit)
  wasteType: z
    .enum(["crop", "vegetable", "fruit", ""])
    .refine((val) => val !== "", {
      message: "Waste type is required",
    }),

  // Waste Category (optional but validated if used)
  wasteCategory: z.string().min(1, "Waste Category is required"),

  // Waste Product (e.g., Wheat, Tomato)
  wasteProduct: z.string().min(1, "Waste Product is required"),

  // Quantity (number input)


  // Moisture Level
  moisture: z.enum(["dry", "semi_wet", "wet", ""]).refine((val) => val !== "", {
    message: "Moisture is required",
  }),

  // Intended Use (compost / feed / sell)
  intendedUse: z.string().min(1, "Intended use is required"),

  // Contamination (yes / no)


  // Optional Notes
});

/**
 * Type inferred from schema
 */
export type processFormDataType = z.infer<typeof processSchema>;

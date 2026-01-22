// components/types/farmerAccount.zod.ts
import { z } from "zod";

const cleanDigits = (v: string) => v.replace(/\D/g, "");

export const farmerAccountSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone Number is Required")
    .refine(
      (p) => {
        const len = cleanDigits(p).length;
        return len === 10 || len === 12;
      },
      {
        message: "Entre a valid phone number",
      }
    ),
  aadharnumber: z
    .string()
    .min(1, "Aadhar number is required")
    .refine((p) => cleanDigits(p).length === 12, {
      message: "Aadhar must be 12 digit",
    }),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  taluka: z.string().min(1, "Taluka is required"),
  village: z.string().min(1, "Village/City is required"),
  houseBuildingName: z.string().min(1, "House/Building is required"),
  roadarealandmarkName: z.string().min(1, "Road/Area/Landmark is required"),

  farmNumber: z.string().min(1, "Document number is required"),
  farmArea: z
    .string()
    .min(1, "Farm area is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: "Area must be greater than 0",
    }),
  farmUnit: z.enum(["hectare", "acre", ""]).refine((f) => f !== "", {
    message: "Required farm Unit",
  }),

  aadhar: z
    .custom<File>()
    .refine((f) => !!f, "Aadhaar file is required")
    .refine((f) => f && f.size <= 1 * 1024 * 1024, {
      message: "Aadhaar file must be less than 1MB",
    }),
  farmdoc: z
    .custom<File>()
    .refine((f) => !!f, "Farm document is required")
    .refine((f) => f && f.size <= 10 * 1024 * 1024, {
      message: "Farm document must be less than 10MB",
    }),
});

export type FarmerAccountForm = z.infer<typeof farmerAccountSchema>;

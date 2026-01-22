import z from "zod";

const cleanDigits = (v: string) => v.replace(/\D/g, "");

export const buyerAccountSchema = z.object({
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
  houseBuildingName: z.string().min(1, "House or building name is required"),
  roadarealandmarkName: z.string().min(1, "Road/Area/Landmark is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  taluka: z.string().min(1, "Taluka is required"),
  village: z.string().min(1, "Village is required"),
  aadhar: z
    .custom<File>()
    .refine((f) => !!f, "File is required")
    .refine((f) => f && f.size <= 1 * 1024 * 1024, {
      message: "Max size is 1MB",
    }),
});

export type BuyerAccountForm = z.infer<typeof buyerAccountSchema>;

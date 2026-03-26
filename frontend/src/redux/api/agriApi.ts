import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { publicEnv } from "@/config/env";

interface RecommendationParams {
  product: string;
  moisture: "dry" | "semi_wet" | "wet";
  intendedUse: string;
  lang: "en" | "mr" | "hi";
}

export interface RecommendationResult {
  benefits: string;
  environmentalImpact: string[];
  finalOutput: string;
  notes: string;
  process: string[];
  processDuration: string[];
  recommendedFor: string[];
  requiredEquipment: string[];
  requiredMaterials: string[];
}

export const agriApi = createApi({
  reducerPath: "agriApi",
  baseQuery: fetchBaseQuery({
    baseUrl: publicEnv.agriApiUrl,
  }),
  tagTypes: ["Agri"],
  endpoints: (builder) => ({
    getRecommendations: builder.query<
      RecommendationResult,
      RecommendationParams
    >({
      query: ({ product, moisture, intendedUse, lang }) => ({
        url: "/recommendation",
        params: {
          product,
          moisture,
          intendedUse,
          lang,
        },
      }),
    }),
  }),
});

export const { useLazyGetRecommendationsQuery } = agriApi;

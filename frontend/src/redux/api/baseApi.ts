import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { publicEnv } from "@/config/env";
import type { RootState } from "../store";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: publicEnv.apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Order", "Profile", "Negotiation", "Notification", "Waste", "Community", "Admin", "Report"],
  endpoints: () => ({}),
});

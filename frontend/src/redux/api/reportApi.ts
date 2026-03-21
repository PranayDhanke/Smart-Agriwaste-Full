import { baseApi } from "./baseApi";

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReport: builder.mutation<
      { message: string },
      {
        targetType: "buyer" | "farmer" | "waste";
        targetId: string;
        reason: string;
        description?: string;
      }
    >({
      query: (body) => ({
        url: "/report",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateReportMutation } = reportApi;

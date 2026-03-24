import { baseApi } from "./baseApi";
import { ModerationReport } from "@/components/types/admin";

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReport: builder.mutation<
      { message: string; report: ModerationReport },
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
      invalidatesTags: [{ type: "Report", id: "MINE" }, "Admin"],
    }),
    getMyReports: builder.query<{ reports: ModerationReport[] }, void>({
      query: () => ({
        url: "/report/mine",
        method: "GET",
      }),
      providesTags: [{ type: "Report", id: "MINE" }],
    }),
  }),
});

export const { useCreateReportMutation, useGetMyReportsQuery } = reportApi;

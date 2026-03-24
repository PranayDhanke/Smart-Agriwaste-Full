import {
  AdminDashboardResponse,
  ManagedUser,
  ModerationReport,
} from "@/components/types/admin";
import { baseApi } from "./baseApi";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    bootstrapAdmin: builder.mutation<
      { message: string; accountdata: ManagedUser },
      void
    >({
      query: () => ({
        url: "/admin/bootstrap",
        method: "POST",
      }),
    }),
    getAdminDashboard: builder.query<AdminDashboardResponse, void>({
      query: () => ({
        url: "/admin/dashboard",
        method: "GET",
      }),

      providesTags: ["Admin", { type: "Waste", id: "LIST" }],
    }),
    getAdminUsers: builder.query<
      { users: ManagedUser[] },
      "buyer" | "farmer" | "admin"
    >({
      query: (role) => ({
        url: "/admin/users",
        params: { role },
      }),
      providesTags: (_result, _error, role) => [{ type: "Admin", id: role }],
    }),
    updateUserBanStatus: builder.mutation<
      { message: string },
      {
        role: "buyer" | "farmer";
        userId: string;
        isBanned: boolean;
        reason?: string;
      }
    >({
      query: ({ role, userId, isBanned, reason }) => ({
        url: `/admin/users/${role}/${userId}/ban`,
        method: "PATCH",
        body: { isBanned, reason },
      }),
      invalidatesTags: (_result, _error, { role }) => [
        { type: "Admin", id: role },
        "Admin",
      ],
    }),
    updateUserVerificationStatus: builder.mutation<
      { message: string },
      {
        role: "buyer" | "farmer";
        userId: string;
        status: "verified" | "rejected";
        reason?: string;
      }
    >({
      query: ({ role, userId, status, reason }) => ({
        url: `/admin/users/${role}/${userId}/verification`,
        method: "PATCH",
        body: { status, reason },
      }),
      invalidatesTags: (_result, _error, { role }) => [
        { type: "Admin", id: role },
        "Admin",
      ],
    }),
    deleteManagedUser: builder.mutation<
      { message: string },
      { role: "buyer" | "farmer" | "admin"; userId: string }
    >({
      query: ({ role, userId }) => ({
        url: `/admin/users/${role}/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { role }) => [
        { type: "Admin", id: role },
        "Admin",
        { type: "Waste", id: "LIST" },
      ],
    }),
    deleteWasteAsAdmin: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/wastes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Waste", id: "LIST" }, "Admin"],
    }),
    getReports: builder.query<{ reports: ModerationReport[] }, void>({
      query: () => "/admin/reports",
      providesTags: ["Admin"],
    }),
    updateReportStatus: builder.mutation<
      { message: string },
      {
        reportId: string;
        status: "reviewed" | "resolved" | "rejected";
        resolutionNote?: string;
      }
    >({
      query: ({ reportId, status, resolutionNote }) => ({
        url: `/admin/reports/${reportId}`,
        method: "PATCH",
        body: { status, resolutionNote },
      }),
      invalidatesTags: ["Admin", { type: "Report", id: "MINE" }],
    }),
  }),
});

export const {
  useBootstrapAdminMutation,
  useDeleteManagedUserMutation,
  useDeleteWasteAsAdminMutation,
  useGetAdminDashboardQuery,
  useGetReportsQuery,
  useGetAdminUsersQuery,
  useUpdateReportStatusMutation,
  useUpdateUserBanStatusMutation,
  useUpdateUserVerificationStatusMutation,
} = adminApi;

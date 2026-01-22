// redux/api/notificationApi.ts
import { NotificationListResponse } from "@/components/types/notification";
import { baseApi } from "./baseApi";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------- QUERIES ---------- */

    // Get notifications for user (cursor pagination)
    getNotifications: builder.query<
      NotificationListResponse,
      { userId: string; cursor?: string; limit?: number }
    >({
      query: ({ userId, cursor, limit = 10 }) => ({
        url: `/notification/get-notification/${userId}`,
        params: { cursor, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.notifications.map((n) => ({
                type: "Notification" as const,
                id: n._id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    getCount: builder.query({
      query: (id) => ({
        url: `/notification/get-notification-count/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: "Notification", id }],
    }),
    /* ---------- MUTATIONS ---------- */

    // Send notification (admin / system)
    sendNotification: builder.mutation<
      { message: string },
      {
        data: {
          userId: string;
          title: string;
          message: string;
          type?: string;
        };
      }
    >({
      query: (body) => ({
        url: `/notification/send-notification`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<{ success: true }, string>({
      query: (id) => ({
        url: `/notification/read-notification/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),

    // Delete notification
    deleteNotification: builder.mutation<{ success: true }, string>({
      query: (id) => ({
        url: `/notification/delete-notification/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

/* =======================
   HOOK EXPORTS
======================= */

export const {
  useGetNotificationsQuery,
  useSendNotificationMutation,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;

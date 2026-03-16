import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { notificationApi } from "../api/notificationAPi";

export const selectUnreadNotificationCount = (userId: string) =>
  createSelector(
    (state: RootState) => state[notificationApi.reducerPath],
    (apiState) => {
      if (!userId) return 0;

      const unreadIds = new Set<string>();

      Object.values(apiState.queries).forEach((queryEntry) => {
        if (!queryEntry || queryEntry.endpointName !== "getNotifications") {
          return;
        }

        const originalArgs = queryEntry.originalArgs as
          | { userId?: string }
          | undefined;

        if (originalArgs?.userId !== userId) {
          return;
        }

        const data = queryEntry.data as
          | { notifications?: Array<{ _id: string; read: boolean }> }
          | undefined;

        data?.notifications?.forEach((notification) => {
          if (!notification.read) {
            unreadIds.add(notification._id);
          }
        });
      });

      return unreadIds.size;
    },
  );

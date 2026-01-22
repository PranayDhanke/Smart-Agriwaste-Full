import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { notificationApi } from "../api/notificationAPi";


export const selectUnreadNotificationCount = (userId: string) =>
  createSelector(
    notificationApi.endpoints.getNotifications.select({ userId }),
    (result) => {
      if (!result?.data?.notifications) return 0;

      return result.data.notifications.filter(
        (notification) => notification.read === false,
      ).length;
    },
  );

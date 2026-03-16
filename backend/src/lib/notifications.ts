import Notification from "../models/notification.model";
import { getIO, getUserSocketRoom } from "./socket";

type NotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: string;
};

export const createNotificationRecord = async ({
  userId,
  title,
  message,
  type = "system",
}: NotificationInput) => {
  const createdNotification = await Notification.create({
    userId,
    title,
    message,
    type,
    read: false,
  });

  const io = getIO();
  if (io) {
    io.to(getUserSocketRoom(userId)).emit(
      "notification:new",
      createdNotification.toObject()
    );
  }

  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (appId && apiKey) {
    try {
      await fetch("https://api.onesignal.com/notifications?c=push", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_id: appId,
          headings: { en: title },
          contents: { en: message },
          include_aliases: { external_id: [userId] },
          target_channel: "push",
        }),
      });
    } catch (error) {
      console.error("Failed to send push notification", error);
    }
  }

  return createdNotification;
};

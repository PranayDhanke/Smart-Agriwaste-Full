import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import notification from "../models/notification.model";

export const sendNotification = async (req: Request, res: Response) => {
  const { userId, title, message, type } = await req.body.data;

  if (!userId || !title || !message) {
    throw new AppError("Insufficient data provided", 400);
  }

  const sendednotification = await notification.create({
    userId,
    title,
    message,
    type: type ?? "system",
    read: false,
  });

  if (!sendednotification) {
    throw new AppError("Failed to log notification", 500);
  }

  const options = {
    method: "POST",
    headers: {
      Authorization: `${process.env.ONESIGNAL_REST_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,

      headings: { en: title },
      contents: { en: message },

      include_aliases: { external_id: [userId] },
      target_channel: "push",
    }),
  };

  await fetch("https://api.onesignal.com/notifications?c=push", options)
    .then((res) => {
      res.json();
    })
    .catch((err) => {
      throw new AppError("Failed to send notification", 500);
    });

  res.status(200).json({ message: "Notificaiton Sended Successfully" });
};

export const getNotification = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const { cursor } = req.query;
  const limit = Math.min(parseInt(req.query.limit as string) | 10, 50);

  const query = cursor ? { userId: id, _id: { $lt: cursor } } : { userId: id };

  const notifications = await notification
    .find(query)
    .sort({
      _id: -1,
    })
    .limit(limit + 1);

  if (!notifications) {
    throw new AppError("Unable to get the notification", 500);
  }

  const hasNext = notifications.length > limit;
  if (hasNext) notifications.pop();

  res.status(200).json({
    success: true,
    notifications,
    pagination: {
      nextCursor: hasNext ? notifications[notifications.length - 1]._id : null,
      limit,
      hasNext,
    },
  });
};

export const updateRead = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const readednotification = await notification.findByIdAndUpdate(id, {
    read: true,
  });

  if (!readednotification) {
    throw new AppError("Failed to read the notification", 500);
  }

  res.status(200).json({ success: true });
};

export const deleteNotification = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const deletedNotification = await notification.findByIdAndDelete(id);

  if (!deletedNotification) {
    throw new AppError("Falied to delete Notification", 500);
  }

  res.status(200).json({ success: true });
};

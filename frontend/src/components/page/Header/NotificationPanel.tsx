"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  notificationApi,
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAsReadMutation,
} from "@/redux/api/notificationAPi";
import { useEffect, useMemo, useRef, useState } from "react";
import { Notification } from "@/components/types/notification";
import { connectSocketForUser } from "@/lib/socket";
import { useDispatch } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query";
import type { AppDispatch } from "@/redux/store";
import { toast } from "sonner";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export default function NotificationPanel({
  open,
  onOpenChange,
  userId,
}: NotificationPanelProps) {
  const t = useTranslations("extra");
  const dispatch = useDispatch<AppDispatch>();
  const [socketNotifications, setSocketNotifications] = useState<Notification[]>([]);
  const toastedNotificationIdsRef = useRef<string[]>([]);

  const { data, isFetching } = useGetNotificationsQuery(
    userId
      ? {
          userId,
          limit: 20,
        }
      : skipToken,
  );
  const [deleteNotification] = useDeleteNotificationMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const notifications = useMemo(() => {
    const notificationMap = new Map<string, Notification>();

    socketNotifications.forEach((notification) => {
      notificationMap.set(notification._id, notification);
    });

    data?.notifications?.forEach((notification) => {
      if (!notificationMap.has(notification._id)) {
        notificationMap.set(notification._id, notification);
      }
    });

    return Array.from(notificationMap.values());
  }, [data?.notifications, socketNotifications]);

  useEffect(() => {
    if (!userId) return;

    const socket = connectSocketForUser(userId);

    const onNotification = (incoming: Notification) => {
      setSocketNotifications((prev) => [
        incoming,
        ...prev.filter((item) => item._id !== incoming._id),
      ]);

      if (!toastedNotificationIdsRef.current.includes(incoming._id)) {
        toast(incoming.title, {
          description: incoming.message,
        });
        toastedNotificationIdsRef.current = [
          incoming._id,
          ...toastedNotificationIdsRef.current,
        ].slice(0, 50);
      }

      dispatch(
        notificationApi.util.updateQueryData(
          "getNotifications",
          { userId, limit: 20 },
          (draft) => {
            const existing = draft.notifications.find(
              (item) => item._id === incoming._id,
            );

            if (existing) {
              Object.assign(existing, incoming);
              return;
            }

            draft.notifications.unshift(incoming);
          },
        ),
      );
    };

    socket.on("notification:new", onNotification);

    return () => {
      socket.off("notification:new", onNotification);
    };
  }, [dispatch, userId]);

  const markAsReadNotification = async (id: string) => {
    await markAsRead(id).unwrap();

    setSocketNotifications((prev) =>
      prev.map((notification) =>
        notification._id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const deleteNotificationAction = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
      setSocketNotifications((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete notification";
      alert(message);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-90 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            {t("NotificationPanel.title")}
            <Badge variant="secondary">{notifications.length}</Badge>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-70px)]">
          <div className="space-y-3 p-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                {t("NotificationPanel.none")}
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  onClick={() => markAsReadNotification(notification._id)}
                  key={notification._id}
                  className={`border p-3 rounded-lg cursor-pointer transition ${
                    notification.read ? "bg-muted" : "bg-green-50 border-green-300"
                  }`}
                >
                  <XCircle
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteNotificationAction(notification._id);
                    }}
                    className="h-5 w-5 float-end text-red-600 cursor-pointer"
                  />

                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
              ))
            )}
          </div>
          <aside className="float-right p-2 text-xs text-slate-400">
            {isFetching ? "Refreshing..." : ""}
          </aside>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

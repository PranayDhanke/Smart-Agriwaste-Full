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
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAsReadMutation,
} from "@/redux/api/notificationAPi";
import { useEffect, useState } from "react";
import { Notification } from "@/components/types/notification";

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

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data, isFetching, refetch } = useGetNotificationsQuery({
    userId,
    cursor,
  });
  const [deleteNotification] = useDeleteNotificationMutation();
  const [markAsRead] = useMarkAsReadMutation();

  useEffect(() => {
    if (!data?.notifications) return;

    setNotifications((prev) => {
      // First page → replace
      if (!cursor) {
        return data.notifications;
      }

      // Next pages → append + dedupe
      const map = new Map<string, Notification>();

      [...prev, ...data.notifications]  .forEach((n) => {
        map.set(n._id, n);
      });

      return Array.from(map.values());
    });
  }, [data, cursor]);

  const loadMore = () => {
    if (data?.pagination.hasNext) {
      setCursor(data.pagination.nextCursor);
    }
  };

  const markAsReadNotification = async (id: string) => {
    await markAsRead(id).unwrap();

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
  };

  const deleteNotificaitonAction = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();

      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err: any) {
      alert(
        err?.data?.message || err?.error || "Failed to delete notification",
      );
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
              notifications.map((n) => (
                <div
                  onClick={() => markAsReadNotification(n._id)}
                  key={n._id}
                  className={`border p-3 rounded-lg cursor-pointer transition ${
                    n.read ? "bg-muted" : "bg-green-50 border-green-300"
                  }`}
                >
                  <XCircle
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotificaitonAction(n._id);
                    }}
                    className="h-5 w-5 float-end text-red-600 cursor-pointer"
                  />

                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              ))
            )}
          </div>
          <aside className="float-right p-2 cursor-pointer">
            {" "}
            {data?.pagination?.hasNext && (
              <button onClick={loadMore} disabled={isFetching}>
                {isFetching ? "Loading..." : "Load more"}
              </button>
            )}
          </aside>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

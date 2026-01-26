"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import OneSignal from "react-onesignal";
import { initOneSignal, loginOneSignal } from "@/lib/onesignal";

export default function OneSignalProvider() {
  const { isLoaded, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  /* ---------- INIT ONCE ---------- */
  useEffect(() => {
    initOneSignal()
      .then(checkPermission)
      .catch(console.error);
  }, []);

  /* ---------- LOGIN USER ---------- */
  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    loginOneSignal(user.id).catch(console.error);
  }, [isLoaded, user?.id]);

  /* ---------- CHECK PERMISSION ---------- */
  const checkPermission = () => {
    try {
      const optedIn = OneSignal.User.PushSubscription.optedIn;
      setShowBanner(!optedIn);
    } catch {
      setShowBanner(true);
    }
  };

  /* ---------- ENABLE ---------- */
  const enableNotifications = async () => {
    try {
      setLoading(true);

      if (!OneSignal.User.PushSubscription.optedIn) {
        await OneSignal.User.PushSubscription.optIn();
      }

      setShowBanner(false);
    } finally {
      setLoading(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
          <Bell className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-900">
            Stay updated
          </p>
          <p className="text-xs text-green-700">
            Get order & negotiation updates instantly
          </p>
        </div>
      </div>

      <button
        onClick={enableNotifications}
        disabled={loading}
        className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white"
      >
        {loading ? "Enabling..." : "Enable"}
      </button>
    </div>
  );
}

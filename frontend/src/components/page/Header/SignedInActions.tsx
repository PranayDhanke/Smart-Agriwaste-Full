"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import ProfileMenu from "./ProfileMenu";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Bell, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUnreadNotificationCount } from "@/redux/selectors/notificationSelector";
import NotificationPanel from "./NotificationPanel";

export default function SignedInActions({ id }: { id: string }) {
  const { user } = useUser();

  const { signOut, openUserProfile } = useClerk();

  const [role, setrole] = useState<"farmer" | "buyer" | "">("");

  useEffect(() => {
    if (user) {
      const role = user.unsafeMetadata.role as "farmer" | "buyer";
      setrole(role);
    }
  }, [user]);

  ///const role = user && (user?.publicMetadata?.role as "farmer" | "buyer");

  const t = useTranslations("header");

  const [notificationOpen, setNotificationOpen] = useState(false);

  const unread = useSelector(selectUnreadNotificationCount(id));

  return (
    <>
      {/* Role CTA */}
      {role === "farmer" && (
        <Link href="/profile/farmer/list-waste">
          <Button
            size="sm"
            className="hidden md:flex bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-1" />
            {t("auth.listWaste")}
          </Button>
        </Link>
      )}

      {/* Notifications */}
      <Button
        onClick={() => setNotificationOpen(true)}
        variant="ghost"
        size="icon"
        className="relative"
      >
        <Bell />
        {unread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
            {unread > 9 ? "9+" : unread}
          </Badge>
        )}
      </Button>

      {/* Profile */}
      <ProfileMenu
        user={{
          id: user?.id || "",
          firstName: user?.firstName || "",
          imageUrl: user?.imageUrl || "",
        }}
        role={role}
        signOut={signOut}
        openUserProfile={openUserProfile}
      />

      <NotificationPanel
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
        userId={user?.id as string}
      />
    </>
  );
}

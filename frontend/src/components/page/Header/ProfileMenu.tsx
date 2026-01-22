"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LogOut, Settings, User } from "lucide-react";

interface ProfileMenuProps {
  user: {
    id: string;
    firstName: string | null;
    imageUrl: string;
  };
  role: string;
  signOut: (options?: { redirectUrl?: string }) => Promise<void>;
  openUserProfile: () => void;
}

export default function ProfileMenu({
  user,
  role,
  signOut,
  openUserProfile,
}: ProfileMenuProps) {
  const t = useTranslations("header");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 hover:bg-green-100">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.imageUrl ?? ""} />
            <AvatarFallback>{user.firstName?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium text-green-700">
            {user.firstName}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t("profile.myAccount")}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={openUserProfile}>
          <User className="mr-2" />
          {t("profile.profile")}
        </DropdownMenuItem>

        <Link href={`/profile/${role}`}>
          <DropdownMenuItem>
            <Settings className="mr-2" />
            {t("profile.settings")}
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/" })}
          className="text-red-600"
        >
          <LogOut className="mr-2" />
          {t("auth.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

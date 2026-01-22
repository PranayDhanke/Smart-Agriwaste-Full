"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { Package, ShoppingBag, User } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SignedOutActions() {
  const t = useTranslations("header");
  return (
    <>
      <Link href="/sign-in" className="hidden sm:block">
        <Button variant="outline" size="sm">
          {t("auth.login")}
        </Button>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <User className="mr-1" />
            {t("auth.signup")}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          <Link href="/sign-up?role=farmer">
            <DropdownMenuItem>
              <Package className="mr-2" /> {t("role.farmer")}
            </DropdownMenuItem>
          </Link>
          <Link href="/sign-up?role=buyer">
            <DropdownMenuItem>
              <ShoppingBag className="mr-2" /> {t("role.buyer")}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

"use client";
import logo from "@/../public/favicon.ico";
import { useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAVIGATION, Role } from "./nav.config";
import DesktopNav from "./DesktopNav";
import { Link } from "@/i18n/navigation";
import MobileNav from "./MobileNav";
import AuthActions from "./AuthAction";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu } from "lucide-react";

export default function Header() {
  const { isSignedIn, user } = useUser();

  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (user?.unsafeMetadata?.role ?? "guest") as Role;
  const navItems = useMemo(
    () => NAVIGATION[isSignedIn ? role : "guest"],
    [isSignedIn, role],
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center gap-2 text-lg font-bold text-green-700"
        >
          <Image src={logo} alt="logo" width={30} height={30} />
          AgriWaste
        </Link>

        <DesktopNav items={navItems} />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <AuthActions />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                aria-label="Open navigation menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm p-0">
              <SheetHeader className="border-b bg-green-50/70 px-6 py-5 text-left">
                <SheetTitle className="flex items-center gap-2 text-green-800">
                  <Image src={logo} alt="logo" width={24} height={24} />
                  Smart AgriWaste
                </SheetTitle>
                <SheetDescription className="text-green-700/80">
                  Quick navigation
                </SheetDescription>
              </SheetHeader>
              <MobileNav
                items={navItems}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

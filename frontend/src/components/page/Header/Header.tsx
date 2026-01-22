"use client";
import logo from "@/../public/favicon.ico"
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
import { Menu, MenuIcon } from "lucide-react";

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
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="font-bold text-green-700 flex justify-center items-center gap-2 text-lg"
        ><Image src={logo} alt="logo" width={30} height={30}/>
          AgriWaste
        </Link>

        <DesktopNav items={navItems} />

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <AuthActions />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Smart Agriwaste</SheetTitle>
                <SheetDescription></SheetDescription>
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

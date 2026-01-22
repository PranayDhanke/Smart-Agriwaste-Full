import { Link } from "@/i18n/navigation";
import { NavItem } from "./nav.config";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";

export default function MobileNav({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const t = useTranslations("header");

  const { user } = useUser();

  return (
    <>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm
            ${
              isActive(item.href)
                ? "bg-green-100 text-green-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {t(item.key)}
          </Link>
        ))}
      </nav>
      <Separator />
      {!user && (
        <div
          onClick={onNavigate}
          className="flex items-center px-4 py-2 gap-2 '"
        >
          <User className="w-5 h-5" />
          <Link href={"/sign-in"}>{t("auth.login")}</Link>
        </div>
      )}
    </>
  );
}

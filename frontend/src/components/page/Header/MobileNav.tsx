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
    <div className="flex h-full flex-col">
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm
            ${
              isActive(item.href)
                ? "bg-green-100 font-medium text-green-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{t(item.key)}</span>
          </Link>
        ))}
      </nav>
      <Separator />
      {!user && (
        <div className="px-4 py-4">
          <Link
            href="/sign-in"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
          >
            <User className="h-5 w-5 shrink-0" />
            <span>{t("auth.login")}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

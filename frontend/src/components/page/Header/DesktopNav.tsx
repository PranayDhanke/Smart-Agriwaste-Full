import { Link, usePathname } from "@/i18n/navigation";
import { NavItem } from "./nav.config";
import { useTranslations } from "next-intl";

export default function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const t = useTranslations("header");

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition
            ${
              isActive(item.href)
                ? "text-green-600 bg-green-50"
                : "text-gray-600 hover:text-green-600 hover:bg-green-50/50"
            }`}
        >
          <item.icon className="w-4 h-4" />
          {t(item.key)}
        </Link>
      ))}
    </nav>
  );
}

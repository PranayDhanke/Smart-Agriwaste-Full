import { Link, usePathname } from "@/i18n/navigation";
import { NavItem } from "./nav.config";
import { useTranslations } from "next-intl";

export default function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const t = useTranslations("header");

  return (
    <nav className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex min-w-0 items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium transition
            ${
              isActive(item.href)
                ? "bg-green-50 text-green-600"
                : "text-gray-600 hover:bg-green-50/50 hover:text-green-600"
            }`}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{t(item.key)}</span>
        </Link>
      ))}
    </nav>
  );
}

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Locale = "en" | "hi" | "mr";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("header.language");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    const cleanPath = pathname.replace(/^\/(en|hi|mr)/, "");
    const query = searchParams.toString();

    router.push(`/${nextLocale}${cleanPath}${query ? `?${query}` : ""}`);
  };

  return (
    <Select value={locale} onValueChange={switchLocale}>
      <SelectTrigger className="h-8 w-16 gap-1 px-2 sm:h-9 sm:w-20 sm:gap-2">
        <Globe className="h-4 w-4" />
        <SelectValue aria-label={t("label")} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="en">{t("en")}</SelectItem>
        <SelectItem value="hi">{t("hi")}</SelectItem>
        <SelectItem value="mr">{t("mr")}</SelectItem>
      </SelectContent>
    </Select>
  );
}

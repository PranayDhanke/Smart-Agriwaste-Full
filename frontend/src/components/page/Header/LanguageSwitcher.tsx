"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Locale = "en" | "hi" | "mr";

export default function LanguageSwitcher() {
  const locale = useLocale();
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
      <SelectTrigger className="h-9 gap-2 w-20">
        <Globe className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="hi">हिंदी</SelectItem>
        <SelectItem value="mr">मराठी</SelectItem>
      </SelectContent>
    </Select>
  );
}

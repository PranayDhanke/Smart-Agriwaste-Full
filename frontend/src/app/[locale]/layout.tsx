import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { enUS, hiIN } from "@clerk/localizations";
import { LocalizationResource } from "@clerk/types";
import { notFound } from "next/navigation";
import Providers from "./providers"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const clerkLocales: Record<string, LocalizationResource> = {
  en: enUS,
  hi: hiIN,
  mr: hiIN,
};
export const metadata: Metadata = {
  title: "Smart Agriwaste",
  description:
    "This is an website useful for farmer for sustainable and agriculutre waste management",
};
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const clerkLocale = clerkLocales[locale] ?? enUS;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html suppressHydrationWarning lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale}>
          <Providers clerkLocale={clerkLocale}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
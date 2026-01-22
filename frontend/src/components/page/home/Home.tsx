"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import FAQ from "./FAQ";
import {
  Leaf,
  Recycle,
  BarChart3,
  ShoppingCart,
  PackagePlus,
  TrendingUp,
} from "lucide-react";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { routing } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations("home");

  const { isSignedIn, user } = useUser();
  const role = user?.unsafeMetadata?.role || "user";

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* ================= HERO SECTION ================= */}
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
        {!isSignedIn ? (
          <>
            {/* Guest View */}
            <h1 className="text-5xl font-extrabold tracking-tight text-green-700 sm:text-6xl">
              {t("hero.guest.title")}
            </h1>

            <p className="mt-6 max-w-2xl text-xl text-gray-600">
              {t("hero.guest.subtitle")}
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/sign-up?role=farmer">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                  <PackagePlus className="mr-2 h-5 w-5" />
                  {t("hero.guest.buttons.farmer")}
                </Button>
              </Link>

              <Link href="/sign-up?role=buyer">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {t("hero.guest.buttons.buyer")}
                </Button>
              </Link>

              <Link href="/marketplace">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg border-2"
                >
                  {t("hero.guest.buttons.marketplace")}
                </Button>
              </Link>
            </div>
          </>
        ) : role === "farmer" ? (
          <>
            {/* Farmer View */}
            <h1 className="text-5xl font-extrabold tracking-tight text-green-700 sm:text-6xl">
              {t(`hero.farmer.title` )} 
            </h1>

            <p className="mt-6 max-w-2xl text-xl text-gray-600">
              {t("hero.farmer.subtitle")}
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/profile/farmer/list-waste">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                  <PackagePlus className="mr-2 h-5 w-5" />
                  {t("hero.farmer.buttons.listWaste")}
                </Button>
              </Link>

              <Link href="/profile/farmer/my-listing">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg border-2"
                >
                  {t("hero.farmer.buttons.myListings")}
                </Button>
              </Link>

              <Link href="/profile/farmer/analytics">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg border-2"
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  {t("hero.farmer.buttons.analytics")}
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Buyer View */}
            <h1 className="text-5xl font-extrabold tracking-tight text-blue-700 sm:text-6xl">
              {t("hero.buyer.title", { name: user?.firstName || "" })}
            </h1>

            <p className="mt-6 max-w-2xl text-xl text-gray-600">
              {t("hero.buyer.subtitle")}
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/marketplace">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {t("hero.buyer.buttons.browse")}
                </Button>
              </Link>

              <Link href="/profile/buyer/my-purchases">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg border-2"
                >
                  {t("hero.buyer.buttons.purchases")}
                </Button>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ================= FEATURES ================= */}
      <section className="mx-auto max-w-6xl px-6 py-16 grid gap-8 md:grid-cols-3">
        <Feature
          icon={<Recycle className="w-8 h-8 text-green-600" />}
          title={t("features.eco.title")}
          description={t("features.eco.description")}
        />

        <Feature
          icon={<Leaf className="w-8 h-8 text-green-600" />}
          title={t("features.fair.title")}
          description={t("features.fair.description")}
        />

        <Feature
          icon={<BarChart3 className="w-8 h-8 text-green-600" />}
          title={t("features.analytics.title")}
          description={t("features.analytics.description")}
        />
      </section>

      {/* ================= PROCESS SECTION ================= */}
      {(!isSignedIn || role === "farmer") && (
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-10 text-center text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-4">{t("process.title")}</h2>

            <p className="text-lg mb-6 opacity-90">{t("process.subtitle")}</p>

            <Link href="/process">
              <Button className="bg-white text-green-700 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                {t("process.button")}
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ================= FAQ ================= */}
      <section className="py-12">
        <FAQ />
      </section>
    </main>
  );
}

/* ================= FEATURE CARD ================= */
function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border-2 border-green-100 bg-white p-8 shadow-sm hover:shadow-md transition">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-green-100 rounded-full">{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-green-700 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

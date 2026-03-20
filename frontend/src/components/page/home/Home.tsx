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
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Home() {
  const t = useTranslations("home");

  const { isSignedIn, user } = useUser();
  const role = user?.unsafeMetadata?.role || "user";

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* ================= HERO SECTION ================= */}
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16 md:py-20">
        {!isSignedIn ? (
          <>
            {/* Guest View */}
            <h1 className="text-3xl font-extrabold tracking-tight text-green-700 sm:text-5xl md:text-6xl">
              {t("hero.guest.title")}
            </h1>

            <p className="mt-4 max-w-2xl text-base text-gray-600 sm:mt-6 sm:text-xl">
              {t("hero.guest.subtitle")}
            </p>

            <div className="mt-8 flex w-full flex-wrap justify-center gap-3 sm:mt-10 sm:gap-4">
              <Link href="/sign-up?role=farmer" className="w-full sm:w-auto">
                <Button className="w-full bg-green-600 px-5 py-5 text-base text-white hover:bg-green-700 sm:px-8 sm:py-6 sm:text-lg">
                  <PackagePlus className="mr-2 h-5 w-5" />
                  {t("hero.guest.buttons.farmer")}
                </Button>
              </Link>

              <Link href="/sign-up?role=buyer" className="w-full sm:w-auto">
                <Button className="w-full bg-blue-600 px-5 py-5 text-base text-white hover:bg-blue-700 sm:px-8 sm:py-6 sm:text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {t("hero.guest.buttons.buyer")}
                </Button>
              </Link>

              <Link href="/marketplace" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full border-2 px-5 py-5 text-base sm:px-8 sm:py-6 sm:text-lg"
                >
                  {t("hero.guest.buttons.marketplace")}
                </Button>
              </Link>
            </div>
          </>
        ) : role === "farmer" ? (
          <>
            {/* Farmer View */}
            <h1 className="text-3xl font-extrabold tracking-tight text-green-700 sm:text-5xl md:text-6xl">
              {t("hero.farmer.title")}
            </h1>

            <p className="mt-4 max-w-2xl text-base text-gray-600 sm:mt-6 sm:text-xl">
              {t("hero.farmer.subtitle")}
            </p>

            <div className="mt-8 flex w-full flex-wrap justify-center gap-3 sm:mt-10 sm:gap-4">
              <Link href="/profile/farmer/list-waste" className="w-full sm:w-auto">
                <Button className="w-full bg-green-600 px-5 py-5 text-base text-white hover:bg-green-700 sm:px-8 sm:py-6 sm:text-lg">
                  <PackagePlus className="mr-2 h-5 w-5" />
                  {t("hero.farmer.buttons.listWaste")}
                </Button>
              </Link>

              <Link href="/profile/farmer/my-listing" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full border-2 px-5 py-5 text-base sm:px-8 sm:py-6 sm:text-lg"
                >
                  {t("hero.farmer.buttons.myListings")}
                </Button>
              </Link>

              <Link href="/profile/farmer/analytics" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full border-2 px-5 py-5 text-base sm:px-8 sm:py-6 sm:text-lg"
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
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-700 sm:text-5xl md:text-6xl">
              {t("hero.buyer.title", { name: user?.firstName || "" })}
            </h1>

            <p className="mt-4 max-w-2xl text-base text-gray-600 sm:mt-6 sm:text-xl">
              {t("hero.buyer.subtitle")}
            </p>

            <div className="mt-8 flex w-full flex-wrap justify-center gap-3 sm:mt-10 sm:gap-4">
              <Link href="/marketplace" className="w-full sm:w-auto">
                <Button className="w-full bg-blue-600 px-5 py-5 text-base text-white hover:bg-blue-700 sm:px-8 sm:py-6 sm:text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {t("hero.buyer.buttons.browse")}
                </Button>
              </Link>

              <Link href="/profile/buyer/my-purchases" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full border-2 px-5 py-5 text-base sm:px-8 sm:py-6 sm:text-lg"
                >
                  {t("hero.buyer.buttons.purchases")}
                </Button>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ================= FEATURES ================= */}
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:gap-8 sm:px-6 sm:py-16 md:grid-cols-3">
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
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="rounded-2xl bg-gradient-to-r from-green-600 to-green-700 p-6 text-center text-white shadow-lg sm:p-10">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">{t("process.title")}</h2>

            <p className="mb-6 text-base opacity-90 sm:text-lg">{t("process.subtitle")}</p>

            <Link href="/process" className="inline-block w-full sm:w-auto">
              <Button className="w-full bg-white px-5 py-5 text-base font-semibold text-green-700 hover:bg-gray-100 sm:w-auto sm:px-8 sm:py-6 sm:text-lg">
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
    <div className="rounded-xl border-2 border-green-100 bg-white p-5 text-center shadow-sm transition hover:shadow-md sm:p-8">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-green-100 p-3">{icon}</div>
      </div>
      <h3 className="mb-3 text-lg font-bold text-green-700 sm:text-xl">{title}</h3>
      <p className="text-sm text-gray-600 sm:text-base">{description}</p>
    </div>
  );
}

"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { FileX, Package, ShoppingBag } from "lucide-react";

const RoleCard: React.FC<{
  href: string;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent?: "green" | "blue" | "amber";
  badge?: string;
}> = ({ href, title, subtitle, Icon, accent = "green", badge }) => {
  const accentBg =
    accent === "green"
      ? "bg-green-100 text-green-700"
      : accent === "blue"
        ? "bg-blue-100 text-blue-700"
        : "bg-amber-100 text-amber-700";

  return (
    <Link href={href} aria-label={`Sign up as ${title}`} className="w-full">
      <div className="group block w-full">
        <button
          type="button"
          className="w-full text-left rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-md ${accentBg} shrink-0`}
            >
              <Icon className="h-6 w-6" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                {badge && (
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>
        </button>
      </div>
    </Link>
  );
};

const SignUpPopUp: React.FC = () => {
  const router = useRouter();
  const t = useTranslations("extra");

  const farmerTitle = t("SignUpPopUp.roles.farmer.title");
  const farmerSubtitle = t("SignUpPopUp.roles.farmer.subtitle");
  const farmerBadge = t("SignUpPopUp.roles.farmer.badge");
  const buyerTitle = t("SignUpPopUp.roles.buyer.title");
  const buyerSubtitle = t("SignUpPopUp.roles.buyer.subtitle");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => router.back()}
      />

      {/* modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-modal-title"
        className="relative z-10 max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="signup-modal-title"
              className="text-lg font-bold text-gray-900"
            >
              {t("SignUpPopUp.title")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t("SignUpPopUp.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              aria-label={t("SignUpPopUp.closeAria")}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <FileX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* role options */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <RoleCard
            href="/sign-up?role=farmer"
            title={farmerTitle}
            subtitle={farmerSubtitle}
            Icon={Package}
            accent="green"
            badge={farmerBadge}
          />

          <RoleCard
            href="/sign-up?role=buyer"
            title={buyerTitle}
            subtitle={buyerSubtitle}
            Icon={ShoppingBag}
            accent="blue"
          />
        </div>

        {/* footer */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-gray-500">
            {t("SignUpPopUp.terms")}{" "}
            <Link
              className="font-medium text-indigo-600 underline"
              href="/terms"
              onClick={(e) => e.stopPropagation()}
            >
              {t("SignUpPopUp.terms")}
            </Link>{" "}
            {"and"}{" "}
            <Link
              className="font-medium text-indigo-600 underline"
              href="/privacy"
              onClick={(e) => e.stopPropagation()}
            >
              {t("SignUpPopUp.privacy")}
            </Link>
            .
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/sign-in")}
              className="rounded-md bg-transparent px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {t("SignUpPopUp.already")}
            </button>
            <button
              onClick={() => router.back()}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {t("SignUpPopUp.cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPopUp;

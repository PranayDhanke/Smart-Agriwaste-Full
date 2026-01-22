"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Leaf
} from "lucide-react";

export default function Footer() {
  const { isSignedIn, user } = useUser();
  const t = useTranslations("footer");

  // ⚠️ UI-only role usage (safe)
  const role = (user?.publicMetadata?.role as "farmer" | "buyer") ?? "farmer";

  return (
    <footer className="bg-gradient-to-br from-green-800 to-green-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ================= BRAND ================= */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold mb-4"
            >
              <div className="bg-white p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-green-700" />
              </div>
              <span>AgriWaste</span>
            </Link>

            <p className="text-green-100 leading-relaxed mb-4">
              {t("brand.description")}
            </p>

            <div className="space-y-2 text-sm text-green-100">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a
                  href={`mailto:${t("brand.email")}`}
                  className="hover:text-white transition"
                >
                  {t("brand.email")}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a
                  href={`tel:${t("brand.phone")}`}
                  className="hover:text-white transition"
                >
                  {t("brand.phone")}
                </a>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span>{t("brand.location")}</span>
              </div>
            </div>
          </div>

          {/* ================= QUICK LINKS ================= */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              {t("sections.quickLinks")}
            </h3>

            <ul className="space-y-2.5 text-green-100">
              <li>
                <Link href="/" className="hover:text-white transition">
                  {t("links.home")}
                </Link>
              </li>

              <li>
                <Link href="/marketplace" className="hover:text-white transition">
                  {t("links.marketplace")}
                </Link>
              </li>

              {(!isSignedIn || role === "farmer") && (
                <li>
                  <Link href="/process" className="hover:text-white transition">
                    {t("links.process")}
                  </Link>
                </li>
              )}

              <li>
                <Link href="/community" className="hover:text-white transition">
                  {t("links.community")}
                </Link>
              </li>

              <li>
                <Link href="/about" className="hover:text-white transition">
                  {t("links.about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= ROLE BASED ================= */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              {!isSignedIn
                ? t("sections.getStarted")
                : role === "farmer"
                ? t("sections.forFarmers")
                : t("sections.forBuyers")}
            </h3>

            <ul className="space-y-2.5 text-green-100">
              {!isSignedIn ? (
                <>
                  <li>
                    <Link
                      href="/sign-up?role=farmer"
                      className="hover:text-white transition"
                    >
                      {t("auth.joinFarmer")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/sign-up?role=buyer"
                      className="hover:text-white transition"
                    >
                      {t("auth.joinBuyer")}
                    </Link>
                  </li>

                  <li>
                    <Link href="/sign-in" className="hover:text-white transition">
                      {t("auth.signIn")}
                    </Link>
                  </li>
                </>
              ) : role === "farmer" ? (
                <>
                  <li>
                    <Link
                      href="/profile/list-waste"
                      className="hover:text-white transition"
                    >
                      {t("farmer.listWaste")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/profile/farmer/my-listing"
                      className="hover:text-white transition"
                    >
                      {t("farmer.myListings")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/profile/farmer/my-orders"
                      className="hover:text-white transition"
                    >
                      {t("farmer.myOrders")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/profile/farmer/analytics"
                      className="hover:text-white transition"
                    >
                      {t("farmer.analytics")}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/marketplace"
                      className="hover:text-white transition"
                    >
                      {t("buyer.browse")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/profile/buyer/my-purchases"
                      className="hover:text-white transition"
                    >
                      {t("buyer.myPurchases")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/profile"
                      className="hover:text-white transition"
                    >
                      {t("buyer.profile")}
                    </Link>
                  </li>
                </>
              )}

              <li>
                <Link href="/community" className="hover:text-white transition">
                  {t("links.help")}
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white transition">
                  {t("links.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= LEGAL + SOCIAL ================= */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              {t("sections.legal")}
            </h3>

            <ul className="space-y-2.5 text-green-100 mb-6">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  {t("legal.privacy")}
                </Link>
              </li>

              <li>
                <Link href="/terms" className="hover:text-white transition">
                  {t("legal.terms")}
                </Link>
              </li>

              <li>
                <Link href="/refund" className="hover:text-white transition">
                  {t("legal.refund")}
                </Link>
              </li>
            </ul>

            <h3 className="font-bold text-lg mb-4">
              {t("sections.followUs")}
            </h3>

            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="bg-green-700 hover:bg-white hover:text-green-700 p-2.5 rounded-full transition"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="border-t border-green-700">
        <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-green-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p>
              © {new Date().getFullYear()} AgriWaste.{" "}
              {t("bottom.rights")}
            </p>

            <p className="flex items-center gap-1">
              {t("bottom.madeWith")}
              <span className="text-red-400">♥</span>
              {t("bottom.for")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

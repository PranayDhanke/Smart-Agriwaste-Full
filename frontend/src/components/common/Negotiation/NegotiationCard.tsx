// components/negotiation/NegotiationCard.tsx
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Droplets,
  IndianRupee,
  Package,
  TrendingDown,
  User,
  X,
} from "lucide-react";
import { Negotiation } from "@/components/types/negotiation";
import { Separator } from "@/components/ui/separator";
import { useLocale, useTranslations } from "next-intl";
import FarmerNegotiationButton from "@/components/page/Negotiation/farmer/FarmerNegotiationButton";
import BuyerNegotiationButton from "@/components/page/Negotiation/buyer/BuyerNegotiationButton";

interface Props {
  negotiation: Negotiation;
  isFarmer: boolean;
}

export default function NegotiationCard({ negotiation: neg, isFarmer }: Props) {
  const locale = useLocale() as "en" | "hi" | "mr";
  const t = useTranslations("profile.farmer.Negotiation");
  const tc = useTranslations("profile.buyer.Negotiation");

  const diff = Math.abs(neg.negotiatedPrice - neg.item.price);
  const percent = Math.round((diff / neg.item.price) * 100);

  const statusVariant =
    neg.status === "pending"
      ? "secondary"
      : neg.status === "accepted"
        ? "default"
        : "destructive";

  return (
    <Card className="overflow-hidden border hover:shadow-md transition-all">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[260px_1fr] gap-0 md:gap-4">
          {/* Image */}
          <div className="relative h-56 md:h-full bg-gray-50">
            {neg.item.image ? (
              <Image
                src={neg.item.image}
                alt={neg.item.title[locale]}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-10 w-10 text-gray-300" />
              </div>
            )}

            <div className="absolute top-3 right-3">
              <Badge variant={statusVariant} className="text-xs">
                {neg.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col h-full">
            <div className="p-4 md:p-6 flex-1 space-y-4">
              {/* Header */}
              <div className="space-y-1">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2">
                  {neg.item.title[locale]}
                </h2>

                <p className="flex flex-wrap items-center gap-1.5 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{isFarmer ? t("offerFrom") : tc("label.farmer")}</span>
                  <span className="font-semibold text-gray-900">
                    {neg.buyerName}
                  </span>
                </p>
              </div>

              <Separator />

              {/* Price + moisture row */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoBox
                  icon={<IndianRupee className="h-4 w-4 text-gray-700" />}
                  label={isFarmer ? t("yourPrice") : tc("stats.listedPrice")}
                  value={`₹${neg.item.price}`}
                  className="bg-gray-50 border-gray-200"
                />

                <InfoBox
                  icon={
                    <TrendingDown
                      className={`h-4 w-4 ${
                        !isFarmer ? "text-green-600" : "text-red-600"
                      }`}
                    />
                  }
                  label={isFarmer ? t("theirOffer") : tc("stats.yourOffer")}
                  value={`₹${neg.negotiatedPrice}`}
                  className={
                    !isFarmer
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }
                />

                <InfoBox
                  icon={<Droplets className="h-4 w-4 text-cyan-600" />}
                  label={t("moisture")}
                  value={neg.item.moisture}
                  className="bg-cyan-50 border-cyan-100"
                />
              </div>

              {/* Discount Info */}

              <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-md">
                <p className="text-xs md:text-sm text-amber-900">
                  <span className="font-semibold">
                    {isFarmer
                      ? t("belowPrice", { percent, diff })
                      : tc("discount.text", { percent, diff })}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            {isFarmer ? (
              <div className="border-t bg-gray-50 px-4 md:px-6 py-3">
                <div className="flex gap-3 flex-col sm:flex-row sm:justify-end">
                  <FarmerNegotiationButton neg={neg} />
                </div>
              </div>
            ) : (
              <div className="border-t bg-gray-50 px-4 md:px-6 py-3">
                <div className="flex gap-3 flex-col sm:flex-row sm:justify-end">
                  <BuyerNegotiationButton neg={neg} />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Small Reusable Info Box ---------- */
function InfoBox({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={`rounded-lg p-3 border text-sm ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[11px] uppercase tracking-wide text-gray-600">
          {label}
        </span>
      </div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

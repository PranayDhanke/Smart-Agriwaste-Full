// components/marketplace/ListingCard.tsx
"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Waste } from "../../types/waste";
import { ChevronRight, Droplets, MapPin, Package } from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "use-intl";
import MarketPlaceButton from "../../page/marketplace/MarketPlaceButton";
import ListWasteButtons from "@/components/page/waste/ListWasteButtons";

export default function ListingCard({
  item,
  isMarketPlace,
}: {
  item: Waste;
  isMarketPlace: boolean;
}) {
  const locale = useLocale() as "en" | "hi" | "mr";

  const t = useTranslations("marketplace.Marketplace");

  const c = useTranslations("wasteCommon");

  return (
    <Card
      key={item._id}
      className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm transition-all duration-300 hover:border-green-300/50 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative h-36 w-full overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title[locale]}
            fill
            sizes="auto"
            priority
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="h-10 w-10 text-gray-300" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Category */}
        <div className="absolute top-2 right-2"></div>

        {/* Price */}
        <div className="absolute bottom-2 left-2">
          <div className="rounded-lg bg-white/95 px-2.5 py-1 shadow-sm backdrop-blur-sm">
            <span className="text-base font-bold text-green-600">
              ₹{item.price}
            </span>
            <span className="text-[10px] text-gray-600">
              /{t(`unit.${item.unit}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {item.title[locale]}
          </h3>
          <p className="text-xs text-gray-500">
            {c(
              `productSet.${item.wasteProduct}`,
            )}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-600">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span className="line-clamp-1">
            {item.address.district.toString()}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Droplets className="h-3 w-3 text-blue-500" />
            <span> {c(`moisture.${item.moisture}`)}</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-green-600">
            <Package className="h-3 w-3" />
            <span>
              {item.quantity} {t(`unit.${item.unit}`)}
            </span>
          </div>
        </div>
      </div>
      <div>
        {isMarketPlace ? (
          <MarketPlaceButton p={item} />
        ) : (
          <ListWasteButtons item={item} />
        )}
      </div>
    </Card>
  );
}

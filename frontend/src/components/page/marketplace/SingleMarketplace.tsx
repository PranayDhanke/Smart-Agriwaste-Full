"use client";

import { JSX, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Package,
  Droplets,
  User,
  Phone,
  Mail,
  ShoppingCart,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle,
  Leaf,
  Recycle,
  Factory,
  TrendingUp,
  Scale,
} from "lucide-react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Waste, WasteType } from "@/components/types/waste";
import { useGetSingleWasteQuery } from "@/redux/api/wasteApi";

const categoryMeta: Record<
  WasteType,
  {
    labelFull: string;
    labelShort: string;
    icon: JSX.Element;
    color: string;
    bgColor: string;
  }
> = {
  crop: {
    labelFull: "category.crop.full",
    labelShort: "category.crop.short",
    icon: <Recycle className="h-5 w-5" />,
    color: "text-emerald-700",
    bgColor: "bg-emerald-100/80",
  },
  fruit: {
    labelFull: "category.fruit.full",
    labelShort: "category.fruit.short",
    icon: <Leaf className="h-5 w-5" />,
    color: "text-amber-700",
    bgColor: "bg-amber-100/80",
  },
  vegetable: {
    labelFull: "category.vegetable.full",
    labelShort: "category.vegetable.short",
    icon: <Factory className="h-5 w-5" />,
    color: "text-blue-700",
    bgColor: "bg-blue-100/80",
  },
};

export default function SingleMarketplace() {
  const locale = useLocale() as "en" | "hi" | "mr";

  const c = useTranslations("wasteCommon");
  const t = useTranslations("marketplace.Singlemarketplace");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const searchParams = useSearchParams();

  const id = searchParams.get("product");

  const { user } = useUser();

  const role = user?.unsafeMetadata.role;

  const { data, isFetching } = useGetSingleWasteQuery(id || "");

  const handleAddToCart = () => {
    if (data) {
      alert(
        t("alerts.added", {
          count: String(quantity),
          title: data.title[locale],
        }),
      );
    }
  };

  const handleBuyNow = () => {
    if (data) {
      alert(t("alerts.buying", { count: String(quantity) }));
      // Navigate to checkout page
    }
  };

  const handleShare = () => {
    if (navigator.share && data) {
      navigator
        .share({
          title: data.title[locale],
          text: data.description[locale],
          url: window.location.href,
        })
        .catch((err) => console.log("Error sharing:", err));
    } else {
      alert(t("alerts.shareUnsupported"));
    }
  };

  if (isFetching) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl" />
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("notFound.title")}
            </h2>
            <p className="text-gray-600 mb-6">{t("notFound.message")}</p>
            <Link href="/marketplace">
              <Button className="bg-green-600 hover:bg-green-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("actions.backToMarketplace")}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalPrice = data.price * quantity;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        {/* Back Button */}
        <Link href="/marketplace">
          <Button variant="ghost" className="mb-6 hover:bg-white/60 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("actions.backToMarketplace")}
          </Button>
        </Link>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image Gallery */}
          <div className="space-y-4">
            <div className="relative box-content w-full h-80  shadow-lg">
              {data.imageUrl ? (
                <Image
                  src={data.imageUrl}
                  alt={data.title[locale]}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className=" flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package className="h-24 w-24 text-gray-300" />
                </div>
              )}

              {/* Category Badge Overlay */}
              <div className="absolute top-4 left-4">
                <div
                  className={`${categoryMeta[data.wasteType as WasteType].bgColor} ${
                    categoryMeta[data.wasteType as WasteType].color
                  } backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-2 shadow-md`}
                >
                  {categoryMeta[data.wasteType as WasteType].icon}
                  {t(categoryMeta[data.wasteType as WasteType].labelFull)}
                </div>
              </div>

              {/* Stock Badge */}
              <div className="absolute top-4 right-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-semibold text-green-600 flex items-center gap-2 shadow-md">
                  <CheckCircle className="h-4 w-4" />
                  {t("stock.inStock")}
                </div>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-white hover:bg-gray-50"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {isFavorite ? t("actions.saved") : t("actions.save")}
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-white hover:bg-gray-50"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {t("actions.share")}
              </Button>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">
                      {t("info.moisture")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {c(`moisture.${data.moisture}`)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">
                      {t("info.quantity")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.quantity}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">
                      {t("info.location")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {data.address.district}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">{t("info.type")}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {t(categoryMeta[data.wasteType as WasteType].labelShort)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - data Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {data.title[locale]}
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                {c(
                  `productSet.${data.wasteType}.${data.wasteCategory}.${data.wasteProduct}`,
                )}
              </p>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600">
                  ₹{data.price}
                </span>
                <span className="text-lg text-gray-600">
                  /{t(`unit.${data.unit}`)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {t("price.inclusive")}
              </p>
            </div>
            {/* Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t("description.title")}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {data.description[locale]}
              </p>
            </div>
            {role === "buyer" && (
              <>
                {/* Quantity Selector */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    {t("quantity.select")}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-10 w-10"
                      >
                        -
                      </Button>
                      <span className="w-16 text-center font-semibold text-gray-900">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-10 w-10"
                      >
                        +
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {t("quantity.totalPrice")}
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        ₹{totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-12 bg-white hover:bg-gray-50 border-gray-300"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {t("actions.addToCart")}
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleBuyNow}
                  >
                    {t("actions.buyNow")}
                  </Button>
                </div>
              </>
            )}

            {/* Seller Information */}
            {data.seller.name && (
              <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    {t("seller.title")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {data.seller.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t("seller.verified")}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a
                          href={`tel:${data.seller.phone}`}
                          className="text-gray-700 hover:text-green-600"
                        >
                          {data.seller.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a
                          href={`mailto:${data.seller.email}`}
                          className="text-gray-700 hover:text-green-600"
                        >
                          {data.seller.email}
                        </a>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-2 border-green-300 hover:bg-green-50"
                    >
                      {t("seller.contact")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    {t("important.title")}
                  </h4>
                  <p className="text-sm text-blue-800">
                    {t("important.message")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

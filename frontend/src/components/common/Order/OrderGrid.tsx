"use client";

import { Order } from "@/components/types/order";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, PackageOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import OrderCard from "./OrderCard";

interface Props {
  orders: Order[];
  loading?: boolean;
  isFarmer: boolean;
  hasFilters?: boolean;
}

export default function OrderGrid({
  orders,
  loading,
  isFarmer,
  hasFilters = false,
}: Props) {
  const t = useTranslations(
    isFarmer ? "profile.farmer.Orders" : "profile.buyer.MyPurchases",
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-green-600" />
        <p className="font-medium text-gray-600">
          {isFarmer ? t("loading") : t("loading.text")}
        </p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-12 text-center">
          <PackageOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="mb-2 text-lg font-semibold text-gray-900">
            {hasFilters
              ? isFarmer
                ? t("empty.noMatch")
                : t("noResults.title")
              : t("empty.title")}
          </p>
          <p className="text-sm text-gray-600">
            {hasFilters
              ? isFarmer
                ? t("empty.noMatch")
                : t("noResults.desc")
              : isFarmer
                ? t("empty.description")
                : t("empty.desc")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} isFarmer={isFarmer} />
      ))}
    </div>
  );
}

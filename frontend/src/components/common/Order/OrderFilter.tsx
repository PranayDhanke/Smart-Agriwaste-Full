"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  isFarmer: boolean;
  statusFilter: string;
  setStatusFilter: (status: "all" | "pending" | "confirmed" | "delivered" | "cancelled") => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  stats: {
    all: number;
    pending: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
  };
}

export default function OrderFilter({
  isFarmer,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  stats,
}: Props) {
  const t = useTranslations(
    isFarmer ? "profile.farmer.Orders" : "profile.buyer.MyPurchases",
  );

  const tabs = [
    { id: "all", label: isFarmer ? t("filters.all") : t("filter.all"), count: stats.all },
    { id: "pending", label: isFarmer ? t("filters.pending") : t("filter.pending"), count: stats.pending },
    { id: "confirmed", label: isFarmer ? t("filters.confirmed") : t("filter.confirmed"), count: stats.confirmed },
    { id: "delivered", label: isFarmer ? t("filters.delivered") : t("filter.delivered"), count: stats.delivered },
    { id: "cancelled", label: isFarmer ? t("filters.cancelled") : t("filter.cancelled"), count: stats.cancelled },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={statusFilter === tab.id ? "default" : "outline"}
            onClick={() => setStatusFilter(tab.id)}
            className="whitespace-nowrap px-3 text-xs sm:text-sm"
          >
            <span>{tab.label}</span>
            <span className="ml-2 font-semibold text-current/80">{tab.count}</span>
          </Button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            isFarmer
              ? t("search.placeholder")
              : t("searchPlaceholder")
          }
          className="h-10 pl-10 pr-10 sm:h-11"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

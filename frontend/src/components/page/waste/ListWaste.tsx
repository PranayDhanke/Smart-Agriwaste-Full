"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Search, X, LoaderCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Waste, WasteType } from "@/components/types/waste";
import { Link } from "@/i18n/navigation";
import ListingsGrid from "@/components/common/list/Listing";
import WastePagination from "@/components/common/Pagination";
import { useLazyGetWastesByFarmerQuery } from "@/redux/api/wasteApi";

const PAGE_SIZE = 12;

export default function MyListing() {
  const { isLoaded, user } = useUser();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<WasteType | "all">("all");

  const locale = useLocale() as "en" | "hi" | "mr";

  const t = useTranslations("myListing");
  const c = useTranslations("wasteCommon");

  const [page, setPage] = useState(1);

  const [cursorMap, setCursorMap] = useState<
    Record<number, string | undefined>
  >({ 1: undefined });

  const cursor = cursorMap[page];

  const [getWastesByFarmer, { data, isFetching, isLoading, isSuccess }] =
    useLazyGetWastesByFarmerQuery();

  useEffect(() => {
    if (isLoaded && user?.id) {
      getWastesByFarmer({
        farmerId: user.id,
        cursor,
        limit: PAGE_SIZE,
      });
    }
  }, [user?.id, isLoaded]);

  useEffect(() => {
    const nextCursor = data?.pagination?.nextCursor ?? undefined;

    if (data?.pagination?.hasNext && nextCursor) {
      setCursorMap((prev) => ({
        ...prev,
        [page + 1]: nextCursor,
      }));
    }
  }, [data, page]);

  const filteredListings = data?.wastedata.filter((item) => {
    const title = item.title?.[locale] || "";
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      selectedType === "all" || item.wasteType === selectedType;
    return matchesSearch && matchesType;
  });

  if (isLoading) return <p>loading...</p>;
  return (
    <main className=" bg-gradient-to-br from-gray-50 to-green-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Minimal Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {" "}
            {t("title")}
          </h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-white border-gray-200 focus:border-green-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex gap-2 mb-6">
          {(["all", "crop", "vegetable", "fruit"] as const).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
            >
              {t(`filters.${type}`)}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {filteredListings?.length || "0"}
            </span>{" "}
            {t("subs.of")}{" "}
            <span className="font-semibold">
              {data?.wastedata.length || "0"}
            </span>{" "}
            {t("subs.listing")}
          </p>
        </div>

        {isSuccess && (
          <ListingsGrid
            isMarketPlace={false}
            loading={isFetching}
            wastes={filteredListings}
          />
        )}

        <section className="p-10">
          <WastePagination
            page={page}
            onPageChange={setPage}
            hasNext={!!data?.pagination?.hasNext}
          />
        </section>
      </div>
    </main>
  );
}

"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Filter,
  MapPin,
  Leaf,
  Recycle,
  Factory,
  Search,
  ChevronRight,
  Droplets,
  X,
  TrendingUp,
  Clock,
  Package,
} from "lucide-react";
import { FilterState, Waste, WasteType } from "@/components/types/waste";
import ListingsGrid from "@/components/common/list/Listing";
import { useGetWastesQuery } from "@/redux/api/wasteApi";
import Paginations from "@/components/common/Pagination";
const categoryMeta: Record<
  WasteType,
  { label: string; icon: JSX.Element; color: string; bgColor: string }
> = {
  crop: {
    label: "category.crop",
    icon: <Recycle className="h-3 w-3" />,
    color: "text-emerald-700",
    bgColor: "bg-emerald-100/80",
  },
  fruit: {
    label: "category.fruit",
    icon: <Leaf className="h-3 w-3" />,
    color: "text-amber-700",
    bgColor: "bg-amber-100/80",
  },
  vegetable: {
    label: "category.vegetable",
    icon: <Factory className="h-3 w-3" />,
    color: "text-blue-700",
    bgColor: "bg-blue-100/80",
  },
};

const PAGE_SIZE = 12;

export default function Marketplace() {
  const locale = useLocale() as "en" | "hi" | "mr";

  const t = useTranslations("marketplace.Marketplace");

  const [page, setPage] = useState(1);

  const [cursorMap, setCursorMap] = useState<
    Record<number, string | undefined>
  >({ 1: undefined });

  const cursor = cursorMap[page];

  const { data, isFetching } = useGetWastesQuery({
    cursor,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    const nextCursor = data?.pagination?.nextCursor ?? undefined;

    if (data?.pagination?.hasNext && nextCursor) {
      setCursorMap((prev) => ({
        ...prev,
        [page + 1]: nextCursor,
      }));
    }
  }, [data, page]);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    address: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "recent",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (
        key === "sortBy" ||
        value === "" ||
        (key === "category" && value === "all")
      )
        return acc;
      return acc + 1;
    }, 0);
    setActiveFiltersCount(count);
  }, [filters]);

  const filtered = useMemo(() => {
    let list = [...(data?.wastedata || [])];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title[locale].toLowerCase().includes(q) ||
          p.wasteProduct.toLowerCase().includes(q) ||
          p.description[locale].toLowerCase().includes(q),
      );
    }

    if (filters.category !== "all") {
      list = list.filter((p) => p.wasteType === filters.category);
    }

    if (filters.address.trim()) {
      const locq = filters.address.toLowerCase();
      list = list.filter((p) => p.address.village.toLowerCase().includes(locq));
    }

    const min = filters.minPrice ? Number(filters.minPrice) : undefined;
    const max = filters.maxPrice ? Number(filters.maxPrice) : undefined;
    list = list.filter((p) => {
      const price = p.price;
      if (min !== undefined && price < min) return false;
      if (max !== undefined && price > max) return false;
      return true;
    });

    if (filters.sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (filters.sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    if (filters.sortBy === "name")
      list.sort((a, b) => a.title[locale].localeCompare(b.title[locale]));

    return list;
  }, [data, filters, locale]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      address: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "recent",
    });
    setShowFilters(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50">
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {t("title")}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">{t("subtitle")}</p>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{filtered.length}</span>
              <span>{t("listingsActive")}</span>
            </div>
          </div>
        </div>

        {/* Main Search */}
        <div className="mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <Input
              placeholder={t("placeholders.search") as string}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-12 h-14 bg-white border-2 border-gray-200 focus:border-green-500 rounded-lg text-base shadow-sm focus:shadow-md transition-all"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange("search", "")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={filters.category === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("category", "all")}
            className={`rounded-full ${
              filters.category === "all"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "border-gray-200 hover:border-green-300"
            }`}
          >
            {t("categories.all")}
          </Button>
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <Button
              key={key}
              variant={filters.category === key ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("category", key)}
              className={`rounded-full flex items-center gap-2 ${
                filters.category === key
                  ? key === "crop"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : key === "fruit"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {meta.icon}
              {t(meta.label)}
            </Button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`${
                showFilters
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "border-gray-200"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? t("filters.hide") : t("filters.show")}{" "}
              {t("filters.label")}
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                {t("filters.clearAll")}
              </Button>
            )}
          </div>

          <Select
            value={filters.sortBy}
            onValueChange={(value: string) =>
              handleFilterChange("sortBy", value)
            }
          >
            <SelectTrigger className="w-full sm:w-[200px] h-10 border-gray-200">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t("sort.mostRecent")}</SelectItem>
              <SelectItem value="price-asc">{t("sort.priceAsc")}</SelectItem>
              <SelectItem value="price-desc">{t("sort.priceDesc")}</SelectItem>
              <SelectItem value="name">{t("sort.name")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {t("filters.location")}
                </Label>
                <Input
                  placeholder="City / District"
                  value={filters.address}
                  onChange={(e) =>
                    handleFilterChange("address", e.target.value)
                  }
                  className="h-10 border-gray-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {t("filters.minPrice")}
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="h-10 border-gray-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {t("filters.maxPrice")}
                </Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="h-10 border-gray-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {t("filters.sortBy")}
                </Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: string) =>
                    handleFilterChange("sortBy", value)
                  }
                >
                  <SelectTrigger className="h-10 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">
                      {t("sort.mostRecent")}
                    </SelectItem>
                    <SelectItem value="price-asc">
                      {t("sort.priceAsc")}
                    </SelectItem>
                    <SelectItem value="price-desc">
                      {t("sort.priceDesc")}
                    </SelectItem>
                    <SelectItem value="name">{t("sort.name")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          {activeFiltersCount > 0 && (
            <div className="text-sm text-gray-600">
              {t("filters.applied")}{" "}
              <span className="font-semibold text-green-600">
                {activeFiltersCount}
              </span>
            </div>
          )}
        </div>
        <ListingsGrid
          wastes={filtered}
          loading={isFetching}
          isMarketPlace={true}
        />
      </section>
      <section className="p-10">
        <Paginations
          page={page}
          onPageChange={setPage}
          hasNext={!!data?.pagination?.hasNext}
        />
      </section>
    </main>
  );
}

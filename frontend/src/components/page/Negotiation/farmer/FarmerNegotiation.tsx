"use client";

import NegotiationsContainer from "@/components/common/Negotiation/NegotiationContainer";
import Paginations from "@/components/common/Pagination";
import { useLazyGetNegotiationsByFarmerQuery } from "@/redux/api/negotiationApi";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const PAGE_SIZE = 5;

export default function FarmerNegotiationsPage() {
  const t = useTranslations("profile.farmer.Negotiation");
  const { user, isLoaded } = useUser();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [cursorMap, setCursorMap] = useState<
    Record<number, string | undefined>
  >({ 1: undefined });

  const cursor = cursorMap[page];

  const [getNegotiationsByFarmer, { data, isFetching }] =
    useLazyGetNegotiationsByFarmerQuery();

  /* 🔁 Reset pagination on filter change */
  useEffect(() => {
    setPage(1);
    setCursorMap({ 1: undefined });
  }, [statusFilter, searchTerm]);

  /* 📡 Fetch negotiations */
  useEffect(() => {
    if (!user?.id || !isLoaded) return;

    getNegotiationsByFarmer({
      farmerId: user.id,
      cursor,
      limit: PAGE_SIZE,
      status: statusFilter === "all" ? undefined : statusFilter,
      search: searchTerm || undefined,
    });
  }, [user?.id, isLoaded, cursor, statusFilter, searchTerm]);

  /* ➡️ Track next cursor */
  useEffect(() => {
    const nextCursor = data?.pagination?.nextCursor;
    if (data?.pagination?.hasNext && nextCursor) {
      setCursorMap((prev) => ({
        ...prev,
        [page + 1]: nextCursor,
      }));
    }
  }, [data, page]);

  const pendingCount = data?.data?.filter((n) => n.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          {pendingCount ? (
            <div className="w-fit rounded-lg bg-amber-100 px-3 py-2 text-sm sm:px-4">
              {pendingCount} Pending
            </div>
          ) : null}
        </div>

        <NegotiationsContainer
          negotiations={data?.data}
          stats={data?.stats}
          loading={isFetching}
          isFarmer
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      <section className="px-4 pb-6 pt-2 sm:p-10">
        <Paginations
          page={page}
          onPageChange={setPage}
          hasNext={!!data?.pagination?.hasNext}
        />
      </section>
    </div>
  );
}

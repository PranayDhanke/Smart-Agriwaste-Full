"use client";

import NegotiationsContainer from "@/components/common/Negotiation/NegotiationContainer";
import Paginations from "@/components/common/Pagination";
import { useLazyGetNegotiationsByBuyerQuery } from "@/redux/api/negotiationApi";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const PAGE_SIZE = 5;

export default function BuyerNegotiationsPage() {
  const t = useTranslations("profile.buyer.Negotiation");
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

  const [getNegotiationsByBuyer, { data, isFetching }] =
    useLazyGetNegotiationsByBuyerQuery();

  /* 🔁 Reset pagination on filter change */
  useEffect(() => {
    setPage(1);
    setCursorMap({ 1: undefined });
  }, [statusFilter, searchTerm]);

  /* 📡 Fetch negotiations */
  useEffect(() => {
    if (!user?.id || !isLoaded) return;

    getNegotiationsByBuyer({
      buyerId: user.id,
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
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          {pendingCount ? (
            <div className="bg-amber-100 px-4 py-2 rounded-lg">
              {pendingCount} Pending
            </div>
          ) : null}
        </div>

        <NegotiationsContainer
          negotiations={data?.data}
          stats={data?.stats}
          loading={isFetching}
          isFarmer={false}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      <section className="p-10">
        <Paginations
          page={page}
          onPageChange={setPage}
          hasNext={!!data?.pagination?.hasNext}
        />
      </section>
    </div>
  );
}

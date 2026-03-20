"use client";

import OrderContainer from "@/components/common/Order/OrderContainer";
import Paginations from "@/components/common/Pagination";
import { Order } from "@/components/types/order";
import { useGetOrdersByBuyerQuery } from "@/redux/api/orderApi";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

function getDisplayStatus(order: Order) {
  if (order.status === "cancelled") return "cancelled";
  if (order.isDelivered) return "delivered";
  return order.status;
}

export default function BuyerOrdersPage() {
  const t = useTranslations("profile.buyer.MyPurchases");
  const { user } = useUser();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "delivered" | "cancelled"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [cursorMap, setCursorMap] = useState<
    Record<number, string | undefined>
  >({ 1: undefined });

  const cursor = cursorMap[page];

  const { data, isFetching } = useGetOrdersByBuyerQuery({
    buyerId: user?.id || "",
    cursor,
    limit: PAGE_SIZE,
  });

  /* 🔁 Reset pagination on filter change */
  useEffect(() => {
    setPage(1);
    setCursorMap({ 1: undefined });
  }, [statusFilter, searchTerm]);

  const filteredOrders = useMemo(() => {
    const orders = data?.orderdata ?? [];
    return orders.filter((order) => {
      const status = getDisplayStatus(order);
      const haystack = [
        order._id,
        order.buyerInfo?.buyerName,
        ...order.items.map((item) => item.title.en),
        ...order.items.map((item) => item.sellerInfo?.seller?.farmerName || ""),
      ]
        .join(" ")
        .toLowerCase();

      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesSearch =
        searchTerm.trim() === "" || haystack.includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [data?.orderdata, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const orders = data?.orderdata ?? [];
    return orders.reduce(
      (acc, order) => {
        const status = getDisplayStatus(order);
        acc.all += 1;
        acc[status as "pending" | "confirmed" | "delivered" | "cancelled"] += 1;
        return acc;
      },
      { all: 0, pending: 0, confirmed: 0, delivered: 0, cancelled: 0 },
    );
  }, [data?.orderdata]);

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const hasNext = page * PAGE_SIZE < filteredOrders.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("title")}</h1>
            <p className="text-sm text-gray-600 sm:text-base">{t("description")}</p>
          </div>
          {stats.pending ? (
            <div className="w-fit rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800 sm:px-4">
              {stats.pending} {t("filter.pending")}
            </div>
          ) : null} 
        </div>

        <OrderContainer
          orders={paginatedOrders}
          loading={isFetching}
          isFarmer={false}
          statusFilter={statusFilter}
          setStatusFilter={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
          searchTerm={searchTerm}
          setSearchTerm={(value) => {
            setPage(1);
            setSearchTerm(value);
          }}
          stats={stats}
        />
      </div>

      <section className="px-4 pb-6 pt-2 sm:p-10">
        <Paginations page={page} onPageChange={setPage} hasNext={hasNext} />
      </section>
    </div>
  );
}

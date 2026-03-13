"use client";

import { Order } from "@/components/types/order";
import OrderFilter from "./OrderFilter";
import OrderGrid from "./OrderGrid";

interface Props {
  orders: Order[];
  loading?: boolean;
  isFarmer: boolean;
  statusFilter: "all" | "pending" | "confirmed" | "delivered" | "cancelled";
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

export default function OrderContainer({
  orders,
  loading,
  isFarmer,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  stats,
}: Props) {
  return (
    <div className="space-y-6">
      <OrderFilter
        isFarmer={isFarmer}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stats={stats}
      />

      <OrderGrid
        orders={orders}
        loading={loading}
        isFarmer={isFarmer}
        hasFilters={statusFilter !== "all" || searchTerm.trim() !== ""}
      />
    </div>
  );
}

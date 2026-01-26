"use client";

import { Negotiation } from "@/components/types/negotiation";
import { useTranslations } from "next-intl";
import NegotiationFilters from "./NegotiationFilter";
import NegotiationsGrid from "./NegotiaionGrid";

interface Props {
  negotiations?: Negotiation[];
  loading?: boolean;
  isFarmer: boolean;

  stats?: {
    pending: number;
    accepted: number;
    rejected: number;
    total: number;
  };

  statusFilter: "all" | "pending" | "accepted" | "rejected";
  setStatusFilter: (v: any) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}

export default function NegotiationsContainer({
  negotiations = [],
  loading,
  isFarmer,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  stats,
}: Props) {
  const t = useTranslations("profile.farmer.Negotiation");

  return (
    <div className="space-y-6">
      {/* Filters (controlled by page) */}
      <NegotiationFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stats={{
          pending: stats?.pending ?? 0,
          accepted: stats?.accepted ?? 0,
          rejected: stats?.rejected ?? 0,
        }}
        isFarmer={isFarmer}
      />
  
      {/* Grid (NO client-side filtering) */}
      <NegotiationsGrid
        negotiations={negotiations}
        loading={loading}
        isFarmer={isFarmer}
        hasFilters={statusFilter !== "all" || searchTerm !== ""}
      />
    </div>
  );
}

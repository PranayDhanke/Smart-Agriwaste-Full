"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface FilterProps {
  statusFilter: string;
  setStatusFilter: (status: any) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  stats: {
    pending: number;
    accepted: number;
    rejected: number;
  };
  isFarmer:boolean
}

export default function NegotiationFilters({
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  stats,
  isFarmer
}: FilterProps) {
  const t = useTranslations("profile.farmer.Negotiation");

  const filterTabs = [
    { id: "all", label: "All Negotiations", count: stats.pending + stats.accepted + stats.rejected },
    { id: "pending", label: "Pending", count: stats.pending, color: "text-amber-600" },
    { id: "accepted", label: "Accepted", count: stats.accepted, color: "text-green-600" },
    { id: "rejected", label: "Rejected", count: stats.rejected, color: "text-red-600" },
  ];

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {filterTabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            variant={statusFilter === tab.id ? "default" : "outline"}
            className="whitespace-nowrap"
          >
            <span>{tab.label}</span>
            <span className={`ml-2 font-semibold ${tab.color || "text-gray-600"}`}>
              {tab.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={`Search by product or ${isFarmer ? "Farmer" : "Buyer"} name...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}


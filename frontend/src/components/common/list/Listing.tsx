// components/marketplace/ListingsGrid.tsx
"use client";

import { Waste } from "../../types/waste";
import { Card } from "../../ui/card";
import ListingCard from "./ListingCard";

interface Props {
  wastes?: Waste[];
  loading?: boolean;
  isMarketPlace: boolean;
}

export default function ListingsGrid({
  wastes = [],
  loading, 
  isMarketPlace,
}: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-gray-200">
            <div className="h-36 bg-gray-200 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!wastes.length) {
    return (
      <div className="text-center py-20 text-gray-500">No listings found</div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {wastes.map((waste) => (
        <ListingCard
          key={waste._id}
          item={waste}
          isMarketPlace={isMarketPlace}
        />
      ))}
    </div>
  );
}

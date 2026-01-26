"use client";

import { Negotiation } from "@/components/types/negotiation";
import { Card, CardContent } from "@/components/ui/card";
import { Box, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import NegotiationCard from "./NegotiationCard";

interface Props {
  negotiations?: Negotiation[];
  loading?: boolean;
  isFarmer: boolean;
  hasFilters?: boolean;
}

export default function NegotiationsGrid({
  negotiations = [],
  loading,
  isFarmer,
  hasFilters = false,
}: Props) {
  const t = useTranslations("profile.farmer.Negotiation");

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-3" />
        <p className="text-gray-600 font-medium">{"Loading negotiations..."}</p>
      </div>
    );
  }

  // Empty state
  if (!negotiations.length) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-12 text-center">
          <Box className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {hasFilters
              ? t("noResultsTitle") || "No negotiations found"
              : t("empty.title") || "No negotiations yet"}
          </p>
          <p className="text-gray-600 text-sm">
            {hasFilters
              ? t("noResultsDescription") || "Try adjusting your filters"
              : t("empty.description") ||
                "Start by creating or receiving negotiation offers"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Grid layout
  return (
    <div className="grid gap-4 grid-cols-1">
      {negotiations.map((neg) => (
        <NegotiationCard key={neg._id} negotiation={neg} isFarmer={isFarmer} />
      ))}
    </div>
  );
}

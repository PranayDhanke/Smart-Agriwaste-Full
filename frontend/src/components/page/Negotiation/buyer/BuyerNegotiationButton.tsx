import { Negotiation } from "@/components/types/negotiation";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

const BuyerNegotiationButton = ({ neg }: { neg: Negotiation }) => {
  const t = useTranslations("profile.buyer.Negotiation");

  return (
    <div>
      <div className="pt-4 border-t">
        {neg.status === "pending" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {t("actions.waiting")}
          </div>
        )}

        {neg.status === "accepted" && (
          <Button className="w-full bg-green-600 hover:bg-green-700">
            {t("actions.placeOrder")}
          </Button>
        )}

        {neg.status === "rejected" && (
          <Button variant="outline" className="w-full">
            {t("actions.sendNewNegotiation")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BuyerNegotiationButton;

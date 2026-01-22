import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { ChevronRight, ShoppingCart } from "lucide-react";

import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { Waste } from "@/components/types/waste";
import { Button } from "@/components/ui/button";
import NegotiationPanel from "./NegotiationPanel";
import { Link } from "@/i18n/navigation";

const MarketPlaceButton = ({ p }: { p: Waste }) => {
  const { user } = useUser();
  const role = user?.unsafeMetadata.role;

  const t = useTranslations("marketplace.Marketplace");

  const [negotiationItem, setNegotiationItem] = useState<Waste | null>(null);
  const handleNegotiate = (item: Waste) => {
    setNegotiationItem(item);
  };

  const handleAddToCart = (item: Waste) => {
    toast.success(`${item.title} added to cart`);
  };
  return (
    <div className=" flex items-center justify-between">
      <Link href={`/marketplace/view/?product=${p._id}`}>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs text-green-700 hover:bg-green-50"
        >
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          {t("actions.view")}
        </Button>
      </Link>

      {/* Not logged in */}
      {!user?.id && (
        <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
          {t("auth.loginBuyer")}
        </p>
      )}

      {role === "buyer" && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-gray-200 hover:bg-gray-50"
            onClick={() => handleAddToCart(p)}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            {t("actions.cart")}
          </Button>

          <Button
            size="sm"
            className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => handleNegotiate(p)}
          >
            🤝 {t("actions.negotiate")}
          </Button>
        </>
      )}
      <section>
        {negotiationItem && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setNegotiationItem(null)}
            />

            {/* Modal */}
            <NegotiationPanel
              item={negotiationItem}
              onClose={() => setNegotiationItem(null)}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default MarketPlaceButton;

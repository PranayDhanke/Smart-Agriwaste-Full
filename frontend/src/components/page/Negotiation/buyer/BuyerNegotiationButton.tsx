import { Negotiation } from "@/components/types/negotiation";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { addToCart } from "@/redux/features/cartSlice";
import NegotiationPanel from "@/components/page/marketplace/NegotiationPanel";
import { Waste } from "@/components/types/waste";

const BuyerNegotiationButton = ({ neg }: { neg: Negotiation }) => {
  const t = useTranslations("profile.buyer.Negotiation");
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);

  const negotiationItem = useMemo<Waste>(
    () => ({
      _id: neg.item.prodId,
      title: neg.item.title,
      description: neg.item.description,
      wasteType: neg.item.wasteType,
      wasteProduct: neg.item.wasteProduct,
      wasteCategory: "negotiation",
      quantity: neg.item.quantity || 1,
      moisture: neg.item.moisture,
      price: neg.item.price,
      imageUrl: neg.item.image,
      unit: neg.item.unit,
      isActive: true,
      seller: {
        farmerId: neg.item.sellerInfo.seller.farmerId,
        name: neg.item.sellerInfo.seller.farmerName,
        phone: "",
        email: "",
      },
      address: neg.item.sellerInfo.address,
    }),
    [neg],
  );

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Sign in as a buyer before adding this to cart.");
      return;
    }

    dispatch(
      addToCart({
        ...neg.item,
        price: neg.negotiatedPrice,
        quantity: neg.item.quantity || 1,
        maxQuantity: neg.item.quantity || 1,
      }),
    );

    toast.success("Negotiated item added to cart. Complete the order from the cart.");
    router.push("/marketplace");
  };

  const handleSendNewNegotiation = () => {
    setIsNegotiationOpen(true);
  };

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
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handlePlaceOrder}
          >
            {t("actions.placeOrder")}
          </Button>
        )}

        {neg.status === "rejected" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSendNewNegotiation}
          >
            {t("actions.sendNewNegotiation")}
          </Button>
        )}
      </div>
      {isNegotiationOpen ? (
        <section>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsNegotiationOpen(false)}
          />
          <NegotiationPanel
            item={negotiationItem}
            onClose={() => setIsNegotiationOpen(false)}
          />
        </section>
      ) : null}
    </div>
  );
};

export default BuyerNegotiationButton;

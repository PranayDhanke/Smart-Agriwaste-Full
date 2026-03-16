"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IndianRupee, Handshake } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Waste } from "@/components/types/waste";
import { useCreateNegotiationMutation } from "@/redux/api/negotiationApi";
import { useSendNotificationMutation } from "@/redux/api/notificationAPi";

type MutationError = {
  data?: { message?: string };
  error?: string;
};

const NegotiationPanel = ({
  item,
  onClose,
}: {
  item: Waste;
  onClose: () => void;
}) => {
  const locale = useLocale() as "en" | "hi" | "mr";
  const [price, setPrice] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("marketplace.NegotiationPanel");
  const { user } = useUser();
  const [createNegotiation] = useCreateNegotiationMutation();
  const [sendNotification] = useSendNotificationMutation();

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!user?.id) {
      toast.error(t("errors.failed"));
      return;
    }

    if (!price || price <= 0) {
      toast.error(t("errors.invalidPrice"));
      return;
    }

    if (price >= item.price) {
      toast.error(t("errors.mustBeLower"));
      return;
    }

    try {
      setIsSubmitting(true);

      await createNegotiation({
        data: {
          buyerId: user.id,
          buyerName: user.fullName || t("buyerPlaceholder"),
          farmerId: item.seller.farmerId,
          negotiatedPrice: price,
          status: "pending",
          item: {
            prodId: item._id,
            title: item.title,
            wasteType: item.wasteType,
            wasteProduct: item.wasteProduct,
            moisture: item.moisture,
            quantity: 1,
            price: item.price,
            unit: item.unit,
            description: item.description,
            image: item.imageUrl,
            sellerInfo: {
              seller: {
                farmerId: item.seller.farmerId,
                farmerName: item.seller.name,
              },
              address: item.address,
            },
          },
        },
      }).unwrap();

      try {
        await sendNotification({
          data: {
            userId: item.seller.farmerId,
            title: t("notification.title"),
            message: t("notification.message", {
              buyer: user.fullName || t("buyerPlaceholder"),
              title: item.title[locale],
            }),
            type: "negotiation",
          },
        }).unwrap();
      } catch (notificationError) {
        console.error(
          "Negotiation created but notification failed",
          notificationError,
        );
      }

      toast.success(t("success.sent"));
      onClose();
    } catch (error: unknown) {
      const mutationError = error as MutationError;
      const message =
        mutationError.data?.message ||
        mutationError.error ||
        t("errors.failed");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      className="fixed left-1/2 top-1/2 z-50 w-full max-w-md
  -translate-x-1/2 -translate-y-1/2
  border border-amber-200/60 shadow-lg bg-white"
    >
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Handshake className="h-5 w-5 text-amber-600" />
          {t("title")}
        </CardTitle>

        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </Button>

        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Product Info */}
        <div className="rounded-md bg-gray-50 p-3 text-sm">
          <p className="font-medium">{item.title[locale]}</p>
          <p className="text-xs text-gray-500">
            {t("listedPrice", { price: item.price, unit: item.unit })}
          </p>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <Label>{t("labels.yourOffer")}</Label>
          <div className="relative">
            <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              min={1}
              max={item.price - 1}
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="pl-8"
            />
          </div>
        </div>

        <Button
          className="w-full bg-amber-500 hover:bg-amber-600"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("buttons.sending") : t("buttons.submit")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NegotiationPanel;

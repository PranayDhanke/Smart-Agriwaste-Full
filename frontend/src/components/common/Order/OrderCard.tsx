"use client";

import { Order } from "@/components/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCancelOrderMutation,
  useConfirmDeliveryMutation,
  useConfirmOrderMutation,
  useSetOutForDeliveryMutation,
} from "@/redux/api/orderApi";
import { CalendarDays, CheckCircle2, MapPin, Package2, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface Props {
  order: Order;
  isFarmer: boolean;
}

function getDisplayStatus(order: Order) {
  if (order.status === "cancelled") return "cancelled";
  if (order.isDelivered) return "delivered";
  return order.status;
}

function getStatusClasses(status: string) {
  if (status === "delivered") return "bg-green-100 text-green-800 border-green-200";
  if (status === "confirmed") return "bg-blue-100 text-blue-800 border-blue-200";
  if (status === "cancelled") return "bg-red-100 text-red-800 border-red-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

export default function OrderCard({ order, isFarmer }: Props) {
  const t = useTranslations(
    isFarmer ? "profile.farmer.Orders" : "profile.buyer.MyPurchases",
  );

  const [confirmOrder, { isLoading: isConfirming }] = useConfirmOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [confirmDelivery, { isLoading: isConfirmingDelivery }] =
    useConfirmDeliveryMutation();
  const [setOutForDelivery, { isLoading: isSettingOut }] =
    useSetOutForDeliveryMutation();

  const status = getDisplayStatus(order);
  const primaryItem = order.items[0];
  const itemCount = order.items.length;
  const partnerName = isFarmer
    ? order.buyerInfo?.buyerName || "-"
    : primaryItem?.sellerInfo?.seller?.farmerName || "-";
  const detailHref = isFarmer
    ? `/profile/farmer/my-orders/single-order?id=${order._id}`
    : `/profile/buyer/my-purchases/single-purchase?id=${order._id}`;

  const disableActions =
    isConfirming || isCancelling || isConfirmingDelivery || isSettingOut;

  const handleConfirmOrder = async () => {
    try {
      await confirmOrder(order._id).unwrap();
      toast.success(
        isFarmer ? t("toast.orderStatusUpdated", { status: "confirmed" }) : t("toast.orderStatusSuccess", { status: "confirmed" }),
      );
    } catch {
      toast.error(isFarmer ? t("errors.updateStatus") : t("toast.changeStatusFailed"));
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(order._id).unwrap();
      toast.success(
        isFarmer ? t("toast.orderStatusUpdated", { status: "cancelled" }) : t("toast.orderStatusSuccess", { status: "cancelled" }),
      );
    } catch {
      toast.error(isFarmer ? t("errors.updateStatus") : t("toast.changeStatusFailed"));
    }
  };

  const handleSetOutForDelivery = async () => {
    try {
      await setOutForDelivery(order._id).unwrap();
      toast.success(isFarmer ? t("toast.outForDelivery") : t("toast.outForDelivery"));
    } catch {
      toast.error(isFarmer ? t("errors.updateDelivery") : t("toast.outForDeliveryFailed"));
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      await confirmDelivery(order._id).unwrap();
      toast.success(isFarmer ? t("toast.delivered") : t("toast.deliveredSuccess"));
    } catch {
      toast.error(isFarmer ? t("errors.confirmDelivery") : t("toast.markDeliveryFailed"));
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm transition hover:shadow-md">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusClasses(status)}>
                {isFarmer
                  ? t(`status.${status}`)
                  : t(`status.${status === "confirmed" && order.deliveryMode === "PICKUPBYBUYER" && !order.isDelivered ? "confirmed" : status}`)}
              </Badge>
              <Badge variant="outline">
                {order.deliveryMode === "DELIVERYBYFARMER"
                  ? isFarmer
                    ? t("delivery.byFarmer")
                    : t("delivery.delivery")
                  : isFarmer
                    ? t("delivery.pickupByBuyer")
                    : t("delivery.pickup")}
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isFarmer ? "Order" : t("orderNumber", { id: order._id.slice(-6) })}
                {isFarmer ? ` #${order._id.slice(-6)}` : ""}
              </h3>
              <p className="text-sm text-gray-600">
                {primaryItem?.title?.en || "Untitled item"}
                {itemCount > 1
                  ? isFarmer
                    ? ` + ${itemCount - 1} more item(s)`
                    : ` ${t("moreItems", { count: itemCount - 1 })}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-gray-500">
              {isFarmer ? t("labels.totalEarning") : t("total")}
            </p>
            <p className="text-2xl font-bold text-green-700">Rs. {order.totalAmount}</p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <Package2 className="h-4 w-4 text-gray-400" />
            <span>{itemCount} {isFarmer ? "item(s)" : t("items")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>
              {isFarmer ? t("labels.buyer") : "Farmer:"} {partnerName}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={detailHref}>
              {isFarmer ? t("actions.view") : t("actions.viewDetails")}
            </Link>
          </Button>

          {isFarmer && order.status === "pending" ? (
            <>
              <Button disabled={disableActions} onClick={handleConfirmOrder}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t("actions.accept")}
              </Button>
              <Button
                variant="destructive"
                disabled={disableActions}
                onClick={handleCancelOrder}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t("actions.reject")}
              </Button>
            </>
          ) : null}

          {!isFarmer && order.status === "pending" ? (
            <Button
              variant="destructive"
              disabled={disableActions}
              onClick={handleCancelOrder}
            >
              <XCircle className="mr-2 h-4 w-4" />
              {t("actions.cancel")}
            </Button>
          ) : null}

          {isFarmer &&
          order.status === "confirmed" &&
          order.deliveryMode === "DELIVERYBYFARMER" &&
          !order.isOutForDelivery &&
          !order.isDelivered ? (
            <Button disabled={disableActions} onClick={handleSetOutForDelivery}>
              <Truck className="mr-2 h-4 w-4" />
              {t("actions.outForDelivery")}
            </Button>
          ) : null}

          {((isFarmer &&
            order.status === "confirmed" &&
            !order.isDelivered &&
            (order.deliveryMode === "PICKUPBYBUYER" || order.isOutForDelivery)) ||
            (!isFarmer &&
              order.status === "confirmed" &&
              !order.isDelivered &&
              (order.deliveryMode === "PICKUPBYBUYER" || order.isOutForDelivery))) ? (
            <Button disabled={disableActions} onClick={handleConfirmDelivery}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isFarmer
                ? t("actions.delivered")
                : order.deliveryMode === "PICKUPBYBUYER"
                  ? t("actions.confirmPickup")
                  : t("actions.outForPickup")}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

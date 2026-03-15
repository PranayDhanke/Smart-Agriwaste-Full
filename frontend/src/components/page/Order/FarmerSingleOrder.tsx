"use client";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Copy,
  User,
  ShoppingBag,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MapPin,
  IndianRupee,
  Zap,
  Share2,
  Phone,
  Navigation,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { useSendNotificationMutation } from "@/redux/api/notificationAPi";
import {
  useCancelOrderMutation,
  useConfirmDeliveryMutation,
  useConfirmOrderMutation,
  useSetDeliveryChargeMutation,
  useSetOutForDeliveryMutation,
  useViewOrderQuery,
} from "@/redux/api/orderApi";

const FarmerOrderView = () => {
  const searchParams = useSearchParams();
  const orderid = searchParams.get("orderid") || searchParams.get("id");
  const t = useTranslations("profile.farmer.SingleOrder");
  const locale = useLocale() as "en" | "mr" | "hi";

  const [copied, setCopied] = useState(false);
  const {
    data: order,
    isLoading,
    isFetching,
  } = useViewOrderQuery(orderid as string, {
    skip: !orderid, 
  });
  const [confirmOrder, { isLoading: isConfirming }] = useConfirmOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [confirmDelivery, { isLoading: isConfirmingDelivery }] =
    useConfirmDeliveryMutation();
  const [setDeliveryCharge, { isLoading: isSavingDeliveryCharge }] =
    useSetDeliveryChargeMutation();
  const [setOutForDeliveryMutation, { isLoading: isSettingOut }] =
    useSetOutForDeliveryMutation();
  const [deliveryChargeInput, setDeliveryChargeInput] = useState("");
  const [secretCodeInput, setSecretCodeInput] = useState("");

  const buyerInfo = order?.buyerInfo.buyerName;
  const buyerAddress = order?.buyerInfo.address;
  const isPickupByBuyer = order?.deliveryMode === "PICKUPBYBUYER";
  const isDeliveryByFarmer = order?.deliveryMode === "DELIVERYBYFARMER";
  const isPending = order?.status === "pending";
  const isConfirmed = order?.status === "confirmed";
  const isCancelled = order?.status === "cancelled";
  const pricingStatus = order?.pricingStatus ?? "pending_farmer_input";
  const deliveryCodeRecipient =
    order?.deliveryCodeRecipient ??
    (isPickupByBuyer ? "farmer" : isDeliveryByFarmer ? "buyer" : undefined);
  const canSetDeliveryCharge =
    isDeliveryByFarmer && isPending && pricingStatus === "pending_farmer_input";
  const awaitingBuyerPriceApproval =
    isDeliveryByFarmer && pricingStatus === "pending_buyer_review";
  const canConfirmPendingOrder =
    isPending &&
    (!isDeliveryByFarmer ||
      pricingStatus === "accepted" ||
      pricingStatus === "not_required");
  const showFarmerSecretCode =
    isPickupByBuyer && deliveryCodeRecipient === "farmer";
  const canCancel =
    !isCancelled && !order?.isDelivered && !order?.isOutForDelivery;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          text: "text-yellow-700 dark:text-yellow-300",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
          dotColor: "bg-yellow-500",
          icon: Clock,
          gradient: "from-yellow-400 to-amber-400",
        };
      case "confirmed":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          border: "border-emerald-200 dark:border-emerald-800",
          text: "text-emerald-700 dark:text-emerald-300",
          bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
          dotColor: "bg-emerald-500",
          icon: CheckCircle2,
          gradient: "from-emerald-400 to-green-400",
        };
      case "cancelled":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-700 dark:text-red-300",
          bgColor: "bg-red-100 dark:bg-red-900/40",
          dotColor: "bg-red-500",
          icon: AlertCircle,
          gradient: "from-red-400 to-rose-400",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-800",
          text: "text-gray-700 dark:text-gray-300",
          bgColor: "bg-gray-100 dark:bg-gray-900/40",
          dotColor: "bg-gray-500",
          icon: AlertCircle,
          gradient: "from-gray-400 to-slate-400",
        };
    }
  };

  const statusConfig = getStatusColor(order?.status || "");

  const copyToClipboard = () => {
    if (order?._id) {
      navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [sendNotification] = useSendNotificationMutation();
  const loading = isLoading || (isFetching && !order);
  const isMutating =
    isConfirming ||
    isCancelling ||
    isConfirmingDelivery ||
    isSettingOut ||
    isSavingDeliveryCharge;

  React.useEffect(() => {
    if (order?.deliveryCharge !== undefined) {
      setDeliveryChargeInput(
        order.deliveryCharge > 0 ? String(order.deliveryCharge) : "",
      );
    }
  }, [order?.deliveryCharge]);

  const changeOrderStatus = async (
    id: string,
    status: "confirmed" | "cancelled",
    buyerId: string,
    farmerName: string,
  ) => {
    try {
      if (status === "confirmed") {
        await confirmOrder(id).unwrap();
      } else {
        await cancelOrder(id).unwrap();
      }

      toast.success(
        t("toast.orderStatusUpdated", { status: t(`status.${status}`) }),
      );
      sendNotification({
        data: {
          userId: buyerId.replace("buy_", "user_"),
          title: t("notify.orderStatusTitle", {
            status: t(`status.${status}`),
          }),
          message: t("notify.orderStatusMessage", {
            farmer: farmerName,
            status: t(`status.${status}`),
          }),
          type: "order",
        },
      });
    } catch {
      toast.error(t("errors.updateStatus"));
    }
  };

  const setOutForDelivery = async (
    id: string,
    buyerId: string,
    farmerName: string,
  ) => {
    try {
      await setOutForDeliveryMutation(id).unwrap();
      toast.success(t("toast.outForDelivery"));
      sendNotification({
        data: {
          userId: buyerId.replace("buy_", "user_"),
          title: t("notify.outForDeliveryTitle"),
          message: t("notify.outForDeliveryMessage", { farmer: farmerName }),
          type: "order",
        },
      });
    } catch {
      toast.error(t("errors.updateDelivery"));
    }
  };

  const conformDelivery = async (
    id: string,
    buyerId: string,
    farmerName: string,
  ) => {
    try {
      if (!secretCodeInput.trim()) {
        toast.error("Enter the 6-digit delivery code shared by the buyer.");
        return;
      }

      await confirmDelivery({
        id,
        secretCode: secretCodeInput.trim(),
      }).unwrap();
      toast.success(t("toast.delivered"));
      sendNotification({
        data: {
          userId: buyerId.replace("buy_", "user_"),
          title: t("notify.deliveredTitle"),
          message: t("notify.deliveredMessage", { farmer: farmerName }),
          type: "order",
        },
      });
    } catch {
      toast.error(t("errors.confirmDelivery"));
    }
  };

  const submitDeliveryCharge = async () => {
    if (!order?._id) return;

    const deliveryCharge = Number(deliveryChargeInput);

    if (Number.isNaN(deliveryCharge) || deliveryCharge < 0) {
      toast.error("Enter a valid delivery charge.");
      return;
    }

    try {
      await setDeliveryCharge({
        orderId: order._id,
        deliveryCharge,
      }).unwrap();
      toast.success("Delivery charge sent to buyer for approval.");
    } catch {
      toast.error("Failed to send delivery charge.");
    }
  };

  const totalEarning = order?.totalAmount || 0;
  const subTotalAmount = order?.subTotalAmount || 0;
  const deliveryCharge = order?.deliveryCharge || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 h-9"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <Loader2 className="h-14 w-14 animate-spin text-amber-600 dark:text-amber-400 relative" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {t("loading")}
            </p>
          </div>
        )}

        {/* Main Content */}
        {!loading && order && (
          <>
            {/* Header Card - Enhanced Status Display */}
            <div className="animate-fade-in">
              <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-900/50 backdrop-blur-sm overflow-hidden">
                <div
                  className={`h-1.5 bg-gradient-to-r ${statusConfig.gradient}`}
                ></div>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    {/* Left Section */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 bg-gradient-to-br ${statusConfig.gradient} rounded-lg shadow-md`}
                        >
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            {t("title")}
                          </h1>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("placedOn", {
                              date: new Intl.DateTimeFormat(locale || "en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }).format(new Date(order.createdAt)),
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Order ID */}
                      <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 w-fit px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          {t("orderId")}
                        </span>
                        <code className="font-mono font-bold text-gray-900 dark:text-white">
                          {order._id.slice(-12).toUpperCase()}
                        </code>
                        <button
                          onClick={copyToClipboard}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title={t("copyTitle")}
                        >
                          <Copy className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        {copied && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            {t("copied")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge - Enhanced with Progress */}
                    <div className="space-y-3 w-full md:w-fit">
                      <div
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 ${statusConfig.bg} ${statusConfig.border} w-fit shadow-md`}
                      >
                        <div
                          className={`h-3 w-3 rounded-full ${
                            statusConfig.dotColor
                          } ${!isCancelled ? "animate-pulse" : ""}`}
                        ></div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                            {t("statusLabel")}
                          </span>
                          <span
                            className={`font-bold text-lg ${statusConfig.text}`}
                          >
                            {t(`status.${order.status}`)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics Grid (2x2) */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in"
              style={{ animationDelay: "50ms" }}
            >
              {/* Total Earning - Highlighted */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
                      {t("metrics.totalEarning")}
                    </span>
                    <IndianRupee className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    ₹{totalEarning.toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>

              {/* Items Count */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      {t("metrics.items")}
                    </span>
                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {order.items.length}
                  </p>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      {t("payment.title")}
                    </span>
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p
                    className={`font-bold ${
                      order.hasPayment
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {order.hasPayment
                      ? t("payment.verified")
                      : t("payment.pending")}
                  </p>
                </CardContent>
              </Card>

              {/* Delivery Mode */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      {t("delivery.title")}
                    </span>
                    <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {isDeliveryByFarmer
                      ? t("delivery.byFarmer")
                      : t("delivery.pickupByBuyer")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Fulfillment Timeline - For Delivery by Farmer */}
            {isDeliveryByFarmer && (
              <Card
                className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 overflow-hidden animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                <div
                  className={`h-1.5 bg-gradient-to-r ${
                    isCancelled
                      ? "from-red-400 to-rose-400"
                      : "from-purple-400 to-indigo-400"
                  }`}
                ></div>
                <CardContent className="pt-8 pb-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap
                          className={`h-5 w-5 ${
                            isCancelled
                              ? "text-red-600 dark:text-red-400"
                              : "text-purple-600 dark:text-purple-400"
                          }`}
                        />
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {t("fulfillment.farmerTitle")}
                        </p>
                      </div>
                      {isCancelled && (
                        <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          {t("status.cancelled")}
                        </Badge>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="flex justify-between relative px-2">
                      {/* Timeline Background */}
                      <div
                        className={`absolute top-5 left-4 right-4 h-1 rounded-full transition-all duration-500 ${
                          isCancelled
                            ? "bg-gradient-to-r from-red-200 to-red-200 dark:from-red-800 dark:to-red-800"
                            : "bg-gradient-to-r from-gray-200 to-gray-200 dark:from-gray-700 dark:to-gray-700"
                        }`}
                      ></div>

                      {/* Timeline Steps */}
                      {[
                        { status: "pending", label: "Received", icon: Package },
                        {
                          status: "confirmed",
                          label: "Confirmed",
                          icon: CheckCircle2,
                        },
                        { status: "confirmed", label: "Shipped", icon: Truck },
                        {
                          status: "confirmed",
                          label: "timeline.complete",
                          icon: CheckCircle2,
                        },
                      ].map((step, idx) => {
                        const isCompleted =
                          !isCancelled &&
                          ((isConfirmed && idx <= 1) ||
                            (isConfirmed &&
                              order.isOutForDelivery &&
                              idx <= 2) ||
                            (isConfirmed && order.isDelivered && idx <= 3) ||
                            (isPending && idx === 0));
                        const StepIcon = step.icon;

                        return (
                          <div
                            key={`${step.status}-${idx}`}
                            className="flex flex-col items-center relative z-10"
                          >
                            <div
                              className={`h-11 w-11 rounded-full border-3 flex items-center justify-center transition-all duration-500 ${
                                isCancelled
                                  ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400"
                                  : isCompleted
                                    ? "bg-gradient-to-br from-purple-400 to-indigo-400 border-purple-500 text-white shadow-lg shadow-purple-400/40"
                                    : "bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 text-gray-400"
                              }`}
                            >
                              <StepIcon className="h-5 w-5" />
                            </div>
                            <p
                              className={`text-xs font-bold mt-3 whitespace-nowrap transition-colors ${
                                isCancelled
                                  ? "text-red-600 dark:text-red-400"
                                  : isCompleted
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-gray-500 dark:text-gray-500"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Cancellation Notice */}
                    {isCancelled && (
                      <div className="mt-4 p-3.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                          {t("cancellation.notice")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Buyer Fulfillment Progress - For Pickup by Buyer */}
            {isPickupByBuyer && (
              <Card
                className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 overflow-hidden animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                <div className="h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
                <CardContent className="pt-8 pb-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {t("fulfillment.buyerTitle")}
                      </p>
                    </div>

                    {/* Simple Status for Pickup */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        {/* Awaiting for Farmer Confirmation */}
                        {isCancelled && (
                          <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase text-yellow-700 dark:text-yellow-400">
                                  {t("fulfillment.currentStatus")}
                                </p>
                                <p className="font-bold mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                  {t("fulfillment.orderCancelled")}
                                </p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
                                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                              </div>
                            </div>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-3">
                              {t("fulfillment.cancelledDesc")}
                            </p>
                          </div>
                        )}

                        {!isConfirmed &&
                          !isCancelled &&
                          !order.isOutForDelivery &&
                          !order.isDelivered && (
                            <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase text-yellow-700 dark:text-yellow-400">
                                    {t("fulfillment.currentStatus")}
                                  </p>
                                  <p className="font-bold mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                    {t("fulfillment.awaitingConfirmation")}
                                  </p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
                                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                              </div>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-3">
                                {t("fulfillment.confirmationDesc")}
                              </p>
                            </div>
                          )}

                        {isConfirmed &&
                          !order.isOutForDelivery &&
                          !order.isDelivered && (
                            <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase text-yellow-700 dark:text-yellow-400">
                                    {t("fulfillment.currentStatus")}
                                  </p>
                                  <p className="font-bold mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                    {t("fulfillment.confirmedTitle")}
                                  </p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
                                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                              </div>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-3">
                                {t("fulfillment.youConfirmed")}
                              </p>
                            </div>
                          )}

                        {/* Ready for Pickup */}
                        {order.isOutForDelivery && !order.isDelivered && (
                          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-400">
                                  {t("fulfillment.currentStatus")}
                                </p>
                                <p className="font-bold mt-1 text-sm text-blue-700 dark:text-blue-300">
                                  {t("fulfillment.buyerOutForPickup")}
                                </p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                                <Navigation className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                              {t("fulfillment.headingToCollect")}
                            </p>
                          </div>
                        )}

                        {/* Pickup Complete */}
                        {order.isDelivered && (
                          <div className="p-4 rounded-lg border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                                  {t("fulfillment.currentStatus")}
                                </p>
                                <p className="font-bold mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                                  {t("fulfillment.pickupComplete")}
                                </p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {showFarmerSecretCode && !order.isDelivered && (
              <Card className="border border-blue-200 bg-blue-50 shadow-sm">
                <CardContent className="space-y-3 pt-5">
                  <p className="text-sm font-semibold text-blue-900">
                    Pickup verification code
                  </p>
                  <p className="text-sm text-blue-800">
                    Share this 6-digit code with the buyer only when the pickup is completed.
                  </p>
                  <div className="rounded-lg border border-blue-300 bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.35em] text-blue-700">
                    {order.deliverySecretCode}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pickup by Buyer Info Card */}
            {isPickupByBuyer && (
              <Card
                className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800 overflow-hidden animate-fade-in"
                style={{ animationDelay: "150ms" }}
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Navigation className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 dark:text-blue-100">
                      {t("buyer.collectTitle")}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      {t("buyer.collectDesc")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Two Column Layout - Buyer Info & Order Summary */}
            <div
              className="grid md:grid-cols-2 gap-6 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              {/* Buyer Details */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 overflow-hidden hover:shadow-xl transition-all">
                <div className="h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {t("buyer.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Buyer Name */}
                  <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">
                      {t("buyer.name")}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {buyerInfo || "N/A"}
                    </p>
                  </div>

                  {/* Buyer Location */}
                  {buyerAddress && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">
                        {t("buyer.deliveryLocation")}
                      </p>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {buyerAddress.village}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {buyerAddress.taluka}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {buyerAddress.district}, {buyerAddress.state}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <a
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white h-10 flex items-center justify-center gap-2"
                      href={`tel:${order.buyerInfo.buyerMobile}`}
                    >
                      <Phone className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">
                        {t("actions.contact")}
                      </span>
                    </a>
                    <Button
                      variant="outline"
                      className="border-blue-200 dark:border-blue-800 h-10 flex items-center justify-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">
                        {t("actions.share")}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 overflow-hidden hover:shadow-xl transition-all">
                <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingBag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    {t("orderInfo.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {/* Payment Method */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      {t("orderInfo.paymentMethod")}
                    </p>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>

                  {/* Delivery Method */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      {t("orderInfo.deliveryMethod")}
                    </p>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {order.deliveryMode === "PICKUPBYBUYER"
                          ? t("delivery.pickupByBuyer")
                          : t("delivery.byFarmer")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Price Breakdown
                    </p>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-700/30">
                      <div className="flex items-center justify-between">
                        <span>Products</span>
                        <span>Rs. {subTotalAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Delivery charge</span>
                        <span>Rs. {deliveryCharge.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between font-semibold">
                        <span>Total</span>
                        <span>Rs. {totalEarning.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Total Earning Highlight */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase mb-1">
                      {t("metrics.yourEarning")}
                    </p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      ₹{totalEarning.toLocaleString("en-IN")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card
              className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 overflow-hidden animate-fade-in"
              style={{ animationDelay: "250ms" }}
            >
              <div className="h-1.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    {t("orderItems")} ({order.items.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.prodId}
                      className="flex gap-4 p-3.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800"
                    >
                      {/* Product Image */}
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white dark:bg-gray-800 flex-shrink-0 shadow-sm">
                        <Image
                          src={item.image}
                          alt={item.title.en}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                            {item.title[locale]}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                              {item.wasteType}
                            </span>
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
                              {item.moisture}% moisture
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1.5">
                          ₹{item.price} × {item.quantity} {item.unit}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg border border-purple-200 dark:border-purple-800 h-fit">
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Verified Badge */}
            {order.hasPayment && (
              <Card
                className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-800 overflow-hidden animate-fade-in"
                style={{ animationDelay: "300ms" }}
              >
                <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                <CardContent className="pt-5 flex items-center gap-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">
                      ✓ {t("payment.verified")}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                      {t("payment.verifiedDesc")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Section - Sticky */}
            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-in sticky bottom-6 bg-gradient-to-t from-white dark:from-slate-800 pt-4"
              style={{ animationDelay: "350ms" }}
            >
              {isCancelled && (
                <Card className="border-0 shadow-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 w-full">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                      {t("sticky.cancelled")}
                    </p>
                  </CardContent>
                </Card>
              )}

              {order.isDelivered && (
                <Card className="border-0 shadow-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 w-full">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">
                      {t("sticky.completed")}
                    </p>
                  </CardContent>
                </Card>
              )}

              {canCancel && (
                <>
                  {canSetDeliveryCharge && (
                    <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Add your delivery charge before confirming this order.
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          type="number"
                          min="0"
                          value={deliveryChargeInput}
                          onChange={(e) => setDeliveryChargeInput(e.target.value)}
                          placeholder="Delivery charge"
                          className="h-11 rounded-md border border-blue-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                        />
                        <Button
                          size="lg"
                          disabled={isMutating}
                          onClick={submitDeliveryCharge}
                          className="h-11 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Send charge to buyer
                        </Button>
                      </div>
                    </div>
                  )}

                  {awaitingBuyerPriceApproval && (
                    <Card className="w-full border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
                      <CardContent className="py-3 text-sm font-medium text-amber-800 dark:text-amber-200">
                        Waiting for buyer to approve the delivery charge before you can confirm this order.
                      </CardContent>
                    </Card>
                  )}

                  {!isConfirmed && canConfirmPendingOrder && (
                    <Button
                      size="lg"
                      disabled={isMutating}
                      onClick={() =>
                        changeOrderStatus(
                          order._id,
                          "confirmed",
                          order.buyerId,
                          order.items[0].sellerInfo.seller.farmerName,
                        )
                      }
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 h-11"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {t("actions.accept")}
                    </Button>
                  )}

                  {!order.hasPayment && (
                    <Button
                      onClick={() =>
                        changeOrderStatus(
                          order._id,
                          "cancelled",
                          order.buyerId,
                          order.items[0].sellerInfo.seller.farmerName,
                        )
                      }
                      size="lg"
                      disabled={isMutating}
                      variant="outline"
                      className="flex items-center gap-2 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all h-11"
                    >
                      <XCircle className="h-5 w-5" />
                      {t("actions.reject")}
                    </Button>
                  )}
                </>
              )}

              {isDeliveryByFarmer && isConfirmed && !order.isOutForDelivery && (
                <Button
                  size="lg"
                  disabled={isMutating}
                  onClick={() =>
                    setOutForDelivery(
                      order._id,
                      order.buyerId,
                      order.items[0].sellerInfo.seller.farmerName,
                    )
                  }
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all h-11"
                >
                  <Truck className="h-5 w-5" />
                  {t("actions.outForDelivery")}
                </Button>
              )}

              {isDeliveryByFarmer &&
                order.isOutForDelivery &&
                !order.isDelivered && (
                  <div className="flex w-full flex-col gap-3 sm:w-auto">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={secretCodeInput}
                      onChange={(e) =>
                        setSecretCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="Enter 6-digit buyer code"
                      className="h-11 rounded-md border border-emerald-300 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    />
                    <Button
                      size="lg"
                      disabled={isMutating}
                      onClick={() =>
                        conformDelivery(
                          order._id,
                          order.buyerId,
                          order.items[0].sellerInfo.seller.farmerName,
                        )
                      }
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all h-11"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {t("actions.confirmDelivery")}
                    </Button>
                  </div>
                )}
            </div>
          </>
        )}

        {/* Not Found State */}
        {!loading && !order && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <AlertCircle className="h-14 w-14 text-gray-400 dark:text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("notFound.title")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm text-sm">
                {t("notFound.message")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default FarmerOrderView;

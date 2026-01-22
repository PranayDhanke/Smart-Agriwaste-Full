"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Search,
  Eye,
  Truck,
  Clock,
  XCircle,
  CreditCard,
  MessageCircle,
  Loader2,
  CheckCircle2,
  Home,
  Calendar,
  User,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Zap,
  ShoppingBag,
  Filter,
} from "lucide-react";

import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import axios from "axios";
import { toast } from "sonner";
import { Order } from "@/components/types/order";

/* ============ Helpers ============ */

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const calcOrderAmount = (items: Order["items"]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

const getStatusConfig = (order: Order, t: any) => {
  if (order.isDelivered) {
    return {
      badge: (
        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
          <CheckCircle2 className="h-3 w-3 mr-2" />
          {t("status.delivered")}
        </Badge>
      ),
      gradient: "from-emerald-500 to-teal-500",
    };
  }

  if (order.isOutForDelivery) {
    return {
      badge: (
        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold">
          <Truck className="h-3 w-3 mr-2" />
          {order.deliveryMode === "PICKUPBYBUYER"
            ? t("status.readyForPickup")
            : t("status.outForDelivery")}
        </Badge>
      ),
      gradient: "from-blue-500 to-cyan-500",
    };
  }

  if (order.status === "cancelled") {
    return {
      badge: (
        <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-semibold">
          <XCircle className="h-3 w-3 mr-2" />
          {t("status.cancelled")}
        </Badge>
      ),
      gradient: "from-red-500 to-rose-500",
    };
  }

  if (order.status === "confirmed") {
    return {
      badge: (
        <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold">
          <CheckCircle2 className="h-3 w-3 mr-2" />
          {t("status.confirmed")}
        </Badge>
      ),
      gradient: "from-purple-500 to-indigo-500",
    };
  }

  return {
    badge: (
      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
        <Clock className="h-3 w-3 mr-2" />
        {t("status.pending")}
      </Badge>
    ),
    gradient: "from-amber-500 to-orange-500",
  };
};

const getDeliveryModeBadge = (mode: string, t: any) => {
  if (mode === "DELIVERYBYFARMER") {
    return (
      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
        <Truck className="h-3 w-3" />
        {t("delivery.delivery")}
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
      <Home className="h-3 w-3" />
      {t("delivery.pickup")}
    </span>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card
    className={`border-0 shadow-sm hover:shadow-md transition-all duration-300 ${color}`}
  >
    <CardContent className="pt-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          {Icon}
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </div>
    </CardContent>
  </Card>
);

/* ============ Main Component ============ */

export default function BuyerPurchasesPage() {
  const t = useTranslations("profile.buyer.MyPurchases");
  const [search, setSearch] = useState("");
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const { user } = useUser();

  const { sendNotification } = useNotification();

  useEffect(() => {
    const buyerId = user?.id.replace("user_", "buy_");

    const fetchOrderData = async () => {
      try {
        if (!buyerId) return;
        const res = await axios.get(`/api/order/getbuyer/${buyerId}`);
        if (res.status === 200) {
          setPurchases(res.data.orderdata);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error(t("toast.loadFailed"));
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [user?.id]);

  const filteredOrders = purchases.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o._id.toLowerCase().includes(q) ||
      o.buyerInfo.buyerName.toLowerCase().includes(q) ||
      o.items.some((i) => i.title.toLowerCase().includes(q));

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "pending")
      return matchesSearch && o.status === "pending";
    if (filterStatus === "confirmed")
      return matchesSearch && o.status === "confirmed";
    if (filterStatus === "delivered") return matchesSearch && o.isDelivered;
    if (filterStatus === "cancelled")
      return matchesSearch && o.status === "cancelled";

    return matchesSearch;
  });

  const stats = {
    pending: purchases.filter((o) => o.status === "pending").length,
    confirmed: purchases.filter((o) => o.status === "confirmed").length,
    delivered: purchases.filter((o) => o.isDelivered).length,
    total: purchases.length,
  };

  const changeOrderStatus = async (
    id: string,
    status: "confirmed" | "cancelled",
    farmerId: string,
    buyerName: string
  ) => {
    try {
      const res = await axios.put("/api/order/changeStatus", { id, status });

      if (res.status === 200) {
        setPurchases((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status } : o))
        );
        const translatedStatus = t(`status.${status}`);
        toast.success(t("toast.orderStatusSuccess", { status: translatedStatus }));
        sendNotification({
          userId: farmerId.replace("fam_", "user_"),
          title: t("notify.titleStatus", { status: translatedStatus }),
          message: t("notify.messageStatus", { buyer: buyerName, status: translatedStatus }),
          type: "order",
        });
      }
    } catch {
      toast.error(t("toast.changeStatusFailed"));
    }
  };

  const setOutForPickup = async (
    id: string,
    farmerId: string,
    buyerName: string
  ) => {
    try {
      const res = await axios.put("/api/order/outForDelivery", { id });
      if (res.status === 200) {
        setPurchases((prev) =>
          prev.map((o) => (o._id === id ? { ...o, isOutForDelivery: true } : o))
        );
        toast.success(t("toast.outForDelivery"));
        sendNotification({
          userId: farmerId.replace("fam_", "user_"),
          title: t("notify.outForPickupTitle"),
          message: t("notify.outForPickupMessage", { buyer: buyerName }),
          type: "order",
        });
      }
    } catch {
      toast.error(t("toast.outForDeliveryFailed"));
    }
  };

  const conformPickup = async (
    id: string,
    farmerId: string,
    buyerName: string
  ) => {
    try {
      const res = await axios.put("/api/order/confirmDelivered", { id });
      if (res.status === 200) {
        setPurchases((prev) =>
          prev.map((o) => (o._id === id ? { ...o, isDelivered: true } : o))
        );
        toast.success(t("toast.deliveredSuccess"));
        sendNotification({
          userId: farmerId.replace("fam_", "user_"),
          title: t("notify.pickedUpTitle"),
          message: t("notify.pickedUpMessage", { buyer: buyerName }),
          type: "order",
        });
      }
    } catch {
      toast.error(t("toast.markDeliveryFailed"));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ============ Header Section ============ */}
        <div className="animate-fade-in">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl shadow-lg">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                  {t("title")}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  {t("description")}
                </p>
              </div>

              <Link
                href="/profile/buyer/negotiations"
                className="animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-700 dark:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 h-11 px-6">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-semibold">{t("negotiations")}</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        {!loading && purchases.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in"
            style={{ animationDelay: "50ms" }}
          >
            <StatCard
              label={t("stats.totalOrders")}
              value={stats.total}
              icon={
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              }
              color="bg-white/50 dark:bg-slate-800/50"
            />
            <StatCard
              label={t("stats.pending")}
              value={stats.pending}
              icon={
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              }
              color="bg-white/50 dark:bg-slate-800/50"
            />
            <StatCard
              label={t("stats.confirmed")}
              value={stats.confirmed}
              icon={
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              }
              color="bg-white/50 dark:bg-slate-800/50"
            />
            <StatCard
              label={t("stats.delivered")}
              value={stats.delivered}
              icon={
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              }
              color="bg-white/50 dark:bg-slate-800/50"
            />
          </div>
        )}

        {/* Search & Filter Section */}
        <div
          className="space-y-3 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-600 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-9 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="all">{t("filter.all")}</option>
                  <option value="pending">{t("filter.pending")}</option>
                  <option value="confirmed">{t("filter.confirmed")}</option>
                  <option value="delivered">{t("filter.delivered")}</option>
                  <option value="cancelled">{t("filter.cancelled")}</option>
                </select>
              </div>
            </div>
          </div>

          {search && filteredOrders.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("foundResults", { count: filteredOrders.length })}
            </p>
          )}
        </div>

        {/* ============ Loading State ============ */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <Loader2 className="h-14 w-14 animate-spin text-emerald-600 dark:text-emerald-400 relative" />
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
              {t("loading.text")}
            </p>
          </div>
        )}

        {/* ============ Empty State ============ */}
        {!loading && purchases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="inline-block p-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <Package className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("empty.title")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto text-lg">
                {t("empty.desc")}
              </p>
              <Link href="/marketplace">
                <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white mt-4 h-11 px-6">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {t("empty.browse")}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ============ No Results ============ */}
        {!loading && purchases.length > 0 && filteredOrders.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Search className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("noResults.title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              {t("noResults.desc")}
            </p>
          </div>
        )}

        {/* ============ Orders List ============ */}
        {!loading && purchases.length > 0 && filteredOrders.length > 0 && (
          <div
            className="space-y-4 animate-fade-in"
            style={{ animationDelay: "150ms" }}
          >
            {filteredOrders.map((order, idx) => {
              const canCancel =
                order.status !== "cancelled" &&
                !order.isDelivered &&
                !order.isOutForDelivery;
              const statusConfig = getStatusConfig(order, t);

              return (
                <Card
                  key={order._id}
                  className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  style={{ animationDelay: `${200 + idx * 50}ms` }}
                >
                  {/* Status Bar */}
                  <div
                    className={`h-1.5 bg-gradient-to-r ${statusConfig.gradient}`}
                  ></div>

                  {/* Header */}
                  <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <CardTitle className="text-lg text-gray-900 dark:text-white">
                            {t("orderNumber", { id: order._id.slice(-8).toUpperCase() })}
                          </CardTitle>
                          {getDeliveryModeBadge(order.deliveryMode, t)}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {order.items[0]?.sellerInfo.seller.farmerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="lg:flex-shrink-0">
                        {statusConfig.badge}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Content */}
                  <CardContent className="space-y-4">
                    {/* Items Preview */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        {t("items")} ({order.items.length})
                      </p>
                      <div className="space-y-1.5">
                        {order.items.slice(0, 2).map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-start text-sm group/item"
                          >
                            <span className="font-medium text-gray-900 dark:text-white line-clamp-1 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2">
                              <span className="text-xs">x{item.quantity}</span>
                              <span className="font-semibold">
                                ₹
                                {(item.price * item.quantity).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic font-medium pt-1">
                            {t("moreItems", { count: order.items.length - 2 })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Total Amount & Payment */}
                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex justify-between items-center p-3.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {t("total")}
                        </span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          ₹
                          {calcOrderAmount(order.items).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 p-3.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex-shrink-0">
                          {order.hasPayment ? (
                            <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold">
                            {t("payment.label")}
                          </p>
                          <p className="text-sm font-bold text-purple-900 dark:text-purple-200">
                            {order.hasPayment ? t("payment.completed") : t("payment.pending")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {/* View Details */}
                      <Link
                        href={`/profile/buyer/my-purchases/single-purchase?orderid=${order._id}`}
                        className="flex-1 sm:flex-initial"
                      >
                        <Button
                          size="sm"
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transition-all"
                        >
                          <Eye className="h-4 w-4" />
                          {t("actions.viewDetails")}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>

                      {/* Cancel */}
                      {canCancel && !order.hasPayment && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center justify-center gap-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={() =>
                            changeOrderStatus(
                              order._id,
                              "cancelled",
                              order.items[0].sellerInfo.seller.farmerId,
                              order.buyerInfo.buyerName
                            )
                          }
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">{t("actions.cancel")}</span>
                        </Button>
                      )}

                      {/* Pickup Actions */}
                      {order.deliveryMode === "PICKUPBYBUYER" &&
                        order.status === "confirmed" &&
                        !order.isOutForDelivery &&
                        !order.isDelivered && (
                          <Button
                            size="sm"
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-sm hover:shadow-md transition-all"
                            onClick={() =>
                              setOutForPickup(
                                order._id,
                                order.items[0].sellerInfo.seller.farmerId,
                                order.buyerInfo.buyerName
                              )
                            }
                          >
                            <Truck className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {t("actions.outForPickup")}
                            </span>
                          </Button>
                        )}

                      {order.deliveryMode === "PICKUPBYBUYER" &&
                        order.status !== "confirmed" &&
                        order.isOutForDelivery &&
                        !order.isDelivered && (
                          <Button
                            size="sm"
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-sm hover:shadow-md transition-all"
                            onClick={() =>
                              conformPickup(
                                order._id,
                                order.items[0].sellerInfo.seller.farmerId,
                                order.buyerInfo.buyerName
                              )
                            }
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span className="hidden sm:inline">
                              {t("actions.confirmPickup")}
                            </span>
                          </Button>
                        )}

                      {/* Payment */}
                      {order.status === "confirmed" && !order.hasPayment && (
                        <Button
                          size="sm"
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transition-all"
                            onClick={() =>
                            toast.success(t("toast.paymentSoon"))
                          }
                        >
                          <CreditCard className="h-4 w-4" />
                          <span className="hidden sm:inline">{t("actions.payNow")}</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
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
    </main>
  );
}

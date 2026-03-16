"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { skipToken } from "@reduxjs/toolkit/query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetOrdersByBuyerQuery, useGetOrdersByFarmerQuery } from "@/redux/api/orderApi";
import {
  useGetNegotiationsByBuyerQuery,
  useGetNegotiationsByFarmerQuery,
} from "@/redux/api/negotiationApi";
import { Handshake, IndianRupee, Package, TrendingUp, Truck } from "lucide-react";

type Role = "farmer" | "buyer";
type Locale = "en" | "hi" | "mr";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function AnalyticsDashboard({ role }: { role: Role }) {
  const { user } = useUser();
  const locale = useLocale() as Locale;

  const farmerOrderResult = useGetOrdersByFarmerQuery(
    user?.id && role === "farmer"
      ? { farmerId: user.id, limit: 50 }
      : skipToken,
  );
  const buyerOrderResult = useGetOrdersByBuyerQuery(
    user?.id && role === "buyer"
      ? { buyerId: user.id, limit: 50 }
      : skipToken,
  );
  const farmerNegotiationResult = useGetNegotiationsByFarmerQuery(
    user?.id && role === "farmer"
      ? { farmerId: user.id, limit: 50 }
      : skipToken,
  );
  const buyerNegotiationResult = useGetNegotiationsByBuyerQuery(
    user?.id && role === "buyer"
      ? { buyerId: user.id, limit: 50 }
      : skipToken,
  );

  const orderResult = role === "farmer" ? farmerOrderResult : buyerOrderResult;
  const negotiationResult =
    role === "farmer" ? farmerNegotiationResult : buyerNegotiationResult;

  const orders = useMemo(() => orderResult.data?.orderdata ?? [], [orderResult.data]);
  const negotiationStats = negotiationResult.data?.stats;
  const negotiations = useMemo(
    () => negotiationResult.data?.data ?? [],
    [negotiationResult.data],
  );

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => order.status === "pending").length;
    const confirmedOrders = orders.filter(
      (order) => order.status === "confirmed",
    ).length;
    const cancelledOrders = orders.filter(
      (order) => order.status === "cancelled",
    ).length;
    const deliveredOrders = orders.filter((order) => order.isDelivered).length;
    const outForDelivery = orders.filter(
      (order) => order.isOutForDelivery && !order.isDelivered,
    ).length;
    const totalOrderValue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );
    const averageOrderValue = totalOrders
      ? Math.round(totalOrderValue / totalOrders)
      : 0;

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
      deliveredOrders,
      outForDelivery,
      totalOrderValue,
      averageOrderValue,
    };
  }, [orders]);

  const recentOrders = [...orders]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  const recentNegotiations = [...negotiations]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  const loading = orderResult.isLoading || negotiationResult.isLoading;
  const heading =
    role === "farmer" ? "Farmer Analytics" : "Buyer Analytics";
  const valueLabel =
    role === "farmer" ? "Revenue tracked" : "Purchases tracked";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4fbf5_0%,#fffdf8_55%,#ffffff_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-emerald-100 bg-white/90 p-6 shadow-[0_20px_80px_rgba(22,101,52,0.10)]">
          <Badge className="mb-4 bg-emerald-600 text-white">{heading}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Orders and negotiations at a glance
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Track how many negotiations are active, how orders are moving, and
            how much value is flowing through your marketplace activity.
          </p>
        </section>

        {loading ? (
          <Card>
            <CardContent className="pt-6 text-sm text-slate-500">
              Loading analytics...
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total negotiations"
                value={negotiationStats?.total ?? 0}
                note={`${negotiationStats?.pending ?? 0} pending now`}
                icon={<Handshake className="h-5 w-5 text-emerald-700" />}
              />
              <MetricCard
                title="Total orders"
                value={metrics.totalOrders}
                note={`${metrics.confirmedOrders} confirmed`}
                icon={<Package className="h-5 w-5 text-sky-700" />}
              />
              <MetricCard
                title={valueLabel}
                value={formatMoney(metrics.totalOrderValue)}
                note={`Average ${formatMoney(metrics.averageOrderValue)}`}
                icon={<IndianRupee className="h-5 w-5 text-amber-700" />}
              />
              <MetricCard
                title="Delivered orders"
                value={metrics.deliveredOrders}
                note={`${metrics.outForDelivery} out for delivery`}
                icon={<Truck className="h-5 w-5 text-violet-700" />}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card className="border-emerald-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Handshake className="h-5 w-5 text-emerald-600" />
                    Negotiation analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatusRow
                    label="Pending"
                    value={negotiationStats?.pending ?? 0}
                    total={negotiationStats?.total ?? 0}
                    color="bg-amber-400"
                  />
                  <StatusRow
                    label="Accepted"
                    value={negotiationStats?.accepted ?? 0}
                    total={negotiationStats?.total ?? 0}
                    color="bg-emerald-500"
                  />
                  <StatusRow
                    label="Rejected"
                    value={negotiationStats?.rejected ?? 0}
                    total={negotiationStats?.total ?? 0}
                    color="bg-rose-500"
                  />
                </CardContent>
              </Card>

              <Card className="border-sky-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-sky-600" />
                    Order analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatusRow
                    label="Pending"
                    value={metrics.pendingOrders}
                    total={metrics.totalOrders}
                    color="bg-amber-400"
                  />
                  <StatusRow
                    label="Confirmed"
                    value={metrics.confirmedOrders}
                    total={metrics.totalOrders}
                    color="bg-emerald-500"
                  />
                  <StatusRow
                    label="Cancelled"
                    value={metrics.cancelledOrders}
                    total={metrics.totalOrders}
                    color="bg-rose-500"
                  />
                  <StatusRow
                    label="Delivered"
                    value={metrics.deliveredOrders}
                    total={metrics.totalOrders}
                    color="bg-violet-500"
                  />
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent negotiations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentNegotiations.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No negotiations yet.
                    </p>
                  ) : (
                    recentNegotiations.map((negotiation) => (
                      <div
                        key={negotiation._id}
                        className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-900">
                            {negotiation.item.title[locale]}
                          </p>
                          <Badge variant="outline" className="capitalize">
                            {negotiation.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          Offer: {formatMoney(negotiation.negotiatedPrice)}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentOrders.length === 0 ? (
                    <p className="text-sm text-slate-500">No orders yet.</p>
                  ) : (
                    recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-900">
                            {order.items[0]?.title?.[locale] || "Order"}
                          </p>
                          <Badge variant="outline" className="capitalize">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          Total: {formatMoney(order.totalAmount)}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  note,
  icon,
}: {
  title: string;
  value: string | number;
  note: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{note}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">{icon}</div>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const width = total > 0 ? `${Math.max((value / total) * 100, 6)}%` : "0%";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { skipToken } from "@reduxjs/toolkit/query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetOrdersByBuyerQuery, useGetOrdersByFarmerQuery } from "@/redux/api/orderApi";
import {
  useGetNegotiationsByBuyerQuery,
  useGetNegotiationsByFarmerQuery,
} from "@/redux/api/negotiationApi";
import { Handshake, IndianRupee, Package, TrendingUp, Truck } from "lucide-react";

// Shadcn Chart Imports
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, Label } from "recharts";

type Role = "farmer" | "buyer";
type Locale = "en" | "hi" | "mr";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

// Define chart colors for consistency
const COLORS = {
  pending: "hsl(var(--warning, 45 93% 47%))", // Amber
  accepted: "hsl(var(--success, 142 71% 45%))", // Emerald
  rejected: "hsl(var(--destructive, 346 87% 43%))", // Rose
  delivered: "hsl(var(--primary, 262 83% 58%))", // Violet
};

export default function AnalyticsDashboard({ role }: { role: Role }) {
  const { user } = useUser();
  const locale = useLocale() as Locale;
  const t = useTranslations("analytics");

  const farmerOrderResult = useGetOrdersByFarmerQuery(
    user?.id && role === "farmer" ? { farmerId: user.id, limit: 50 } : skipToken,
  );
  const buyerOrderResult = useGetOrdersByBuyerQuery(
    user?.id && role === "buyer" ? { buyerId: user.id, limit: 50 } : skipToken,
  );
  const farmerNegotiationResult = useGetNegotiationsByFarmerQuery(
    user?.id && role === "farmer" ? { farmerId: user.id, limit: 50 } : skipToken,
  );
  const buyerNegotiationResult = useGetNegotiationsByBuyerQuery(
    user?.id && role === "buyer" ? { buyerId: user.id, limit: 50 } : skipToken,
  );

  const orderResult = role === "farmer" ? farmerOrderResult : buyerOrderResult;
  const negotiationResult = role === "farmer" ? farmerNegotiationResult : buyerNegotiationResult;

  const orders = useMemo(() => orderResult.data?.orderdata ?? [], [orderResult.data]);
  const negotiationStats = negotiationResult.data?.stats;
  const negotiations = useMemo(() => negotiationResult.data?.data ?? [], [negotiationResult.data]);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => order.status === "pending").length;
    const confirmedOrders = orders.filter((order) => order.status === "confirmed").length;
    const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;
    const deliveredOrders = orders.filter((order) => order.isDelivered).length;
    const outForDelivery = orders.filter((order) => order.isOutForDelivery && !order.isDelivered).length;
    const totalOrderValue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = totalOrders ? Math.round(totalOrderValue / totalOrders) : 0;

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
  const heading = role === "farmer" ? t("headingFarmer") : t("headingBuyer");
  const valueLabel =
    role === "farmer"
      ? t("valueLabels.revenueTracked")
      : t("valueLabels.purchasesTracked");

  // --- CHART DATA PREPARATION ---
  
  const negotiationChartData = useMemo(() => [
    { status: t("status.pending"), count: negotiationStats?.pending ?? 0, fill: COLORS.pending },
    { status: t("status.accepted"), count: negotiationStats?.accepted ?? 0, fill: COLORS.accepted },
    { status: t("status.rejected"), count: negotiationStats?.rejected ?? 0, fill: COLORS.rejected },
  ], [negotiationStats, t]);

  const orderChartData = useMemo(() => [
    { status: t("status.pending"), count: metrics.pendingOrders, fill: COLORS.pending },
    { status: t("status.confirmed"), count: metrics.confirmedOrders, fill: COLORS.accepted },
    { status: t("status.cancelled"), count: metrics.cancelledOrders, fill: COLORS.rejected },
    { status: t("status.delivered"), count: metrics.deliveredOrders, fill: COLORS.delivered },
  ], [metrics, t]);

  const negotiationChartConfig = {
    count: { label: t("chartUnits.count") },
    [t("status.pending")]: { label: t("status.pending"), color: COLORS.pending },
    [t("status.accepted")]: { label: t("status.accepted"), color: COLORS.accepted },
    [t("status.rejected")]: { label: t("status.rejected"), color: COLORS.rejected },
  } satisfies ChartConfig;

  const orderChartConfig = {
    count: { label: t("chartUnits.orders") },
  } satisfies ChartConfig;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4fbf5_0%,#fffdf8_55%,#ffffff_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Section */}
        <section className="rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-md p-8 shadow-sm">
          <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-sm">{heading}</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t("overviewTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
            {t("overviewDescription")}
          </p>
        </section>

        {loading ? (
          <Card className="flex items-center justify-center min-h-[400px]">
            <CardContent className="text-slate-500 animate-pulse font-medium text-lg">
              {t("loading")}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Metrics Grid */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title={t("metrics.totalNegotiations")}
                value={negotiationStats?.total ?? 0}
                note={t("metrics.pendingNow", { count: negotiationStats?.pending ?? 0 })}
                icon={<Handshake className="h-6 w-6 text-emerald-600" />}
              />
              <MetricCard
                title={t("metrics.totalOrders")}
                value={metrics.totalOrders}
                note={t("metrics.confirmedCount", { count: metrics.confirmedOrders })}
                icon={<Package className="h-6 w-6 text-sky-600" />}
              />
              <MetricCard
                title={valueLabel}
                value={formatMoney(metrics.totalOrderValue)}
                note={t("metrics.average", { value: formatMoney(metrics.averageOrderValue) })}
                icon={<IndianRupee className="h-6 w-6 text-amber-600" />}
              />
              <MetricCard
                title={t("metrics.deliveredOrders")}
                value={metrics.deliveredOrders}
                note={t("metrics.outForDelivery", { count: metrics.outForDelivery })}
                icon={<Truck className="h-6 w-6 text-violet-600" />}
              />
            </section>

            {/* Charts Grid */}
            <section className="grid gap-6 lg:grid-cols-2">
              
              {/* Negotiation Donut Chart */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5 text-slate-700" />
                    {t("charts.negotiationBreakdown")}
                  </CardTitle>
                  <CardDescription>{t("charts.negotiationDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer config={negotiationChartConfig} className="mx-auto aspect-square max-h-[300px]">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={negotiationChartData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-slate-900 text-3xl font-bold">
                                    {negotiationStats?.total ?? 0}
                                  </tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-slate-500 text-sm">
                                    {t("charts.total")}
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </Pie>
                      <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Orders Bar Chart */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-slate-700" />
                    {t("charts.orderPipeline")}
                  </CardTitle>
                  <CardDescription>{t("charts.orderDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={orderChartConfig} className="aspect-auto h-[300px] w-full">
                    <BarChart
                      accessibilityLayer
                      data={orderChartData}
                      margin={{ top: 20, left: -20, right: 12, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="status"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        className="text-xs font-medium text-slate-600"
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={10} className="text-xs text-slate-500" />
                      <ChartTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={<ChartTooltipContent hideIndicator />} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {orderChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

            </section>

            {/* Recent Activity Lists */}
            <section className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>{t("recent.negotiationsTitle")}</CardTitle>
                  <CardDescription>{t("recent.negotiationsDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentNegotiations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                      {t("recent.noNegotiations")}
                    </div>
                  ) : (
                    recentNegotiations.map((negotiation) => (
                      <div key={negotiation._id} className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-900">{negotiation.item.title[locale]}</p>
                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            {t("recent.offer", { value: formatMoney(negotiation.negotiatedPrice) })}
                          </p>
                        </div>
                        <Badge variant="outline" className={`capitalize ${negotiation.status === 'accepted' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : negotiation.status === 'rejected' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'bg-white'}`}>
                          {t(`status.${negotiation.status}`)}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>{t("recent.ordersTitle")}</CardTitle>
                  <CardDescription>{t("recent.ordersDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentOrders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                      {t("recent.noOrders")}
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order._id} className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-900">{order.items[0]?.title?.[locale] || t("recent.marketplaceOrder")}</p>
                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {t("recent.total", { value: formatMoney(order.totalAmount) })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {t(`status.${order.status}`)}
                        </Badge>
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
    <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex flex-col justify-between p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">{icon}</div>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-400">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

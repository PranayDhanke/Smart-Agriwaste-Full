"use client";

import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { skipToken } from "@reduxjs/toolkit/query";
import { FileSearch, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { useGetMyReportsQuery } from "@/redux/api/reportApi";
import type { ModerationReport } from "@/components/types/admin";

const statusClassName: Record<ModerationReport["status"], string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  reviewed: "border-sky-200 bg-sky-50 text-sky-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const statusLabel: Record<ModerationReport["status"], string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  resolved: "Resolved",
  rejected: "Rejected",
};

export default function MyReportsPage() {
  const t = useTranslations("report");
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { data, isFetching, isLoading } = useGetMyReportsQuery(
    isLoaded && isSignedIn ? undefined : skipToken,
  );

  const reports = useMemo(() => data?.reports ?? [], [data?.reports]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("auth.title")}</CardTitle>
            <CardDescription>
              Sign in to see the reports you have submitted and their current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/sign-in")}>{t("auth.button")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="border-slate-200/60 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle>My Reports</CardTitle>
              <CardDescription>
                Track the review status of the reports you have submitted.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/report")}
            >
              New Report
            </Button>
          </CardHeader>
        </Card>

        {isLoading || isFetching ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : reports.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white/90">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <FileSearch className="h-10 w-10 text-slate-400" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-900">No reports yet</p>
                <p className="text-sm text-slate-500">Your submitted reports will appear here.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report._id} className="border-slate-200/70 bg-white shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-500">
                        Report #{report._id.slice(-6).toUpperCase()}
                      </p>
                      <h3 className="text-lg font-semibold capitalize text-slate-900">
                        {t(`types.${report.targetType}`)}
                      </h3>
                    </div>
                    <Badge variant="outline" className={`capitalize ${statusClassName[report.status]}`}>
                      {statusLabel[report.status]}
                    </Badge>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <p className="font-medium text-slate-900">{t("fields.reason")}</p>
                      <p>{report.reason}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{t("fields.targetId")}</p>
                      <p className="break-all">{report.targetId}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Created</p>
                      <p>{new Date(report.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Reviewed</p>
                      <p>
                        {report.reviewedAt
                          ? new Date(report.reviewedAt).toLocaleString()
                          : "Not reviewed yet"}
                      </p>
                    </div>
                  </div>

                  {report.description ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{t("fields.extraDetails")}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{report.description}</p>
                    </div>
                  ) : null}

                  {report.resolutionNote ? (
                    <div className="rounded-xl bg-emerald-50 px-4 py-3">
                      <p className="text-sm font-medium text-emerald-900">Admin Note</p>
                      <p className="mt-1 text-sm leading-6 text-emerald-800">{report.resolutionNote}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

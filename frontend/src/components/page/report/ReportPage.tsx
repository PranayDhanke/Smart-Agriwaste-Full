"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateReportMutation } from "@/redux/api/reportApi";

export default function ReportPage() {
  const t = useTranslations("report");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();
  const [createReport, { isLoading }] = useCreateReportMutation();

  const initialType = useMemo(
    () => (searchParams.get("type") as "buyer" | "farmer" | "waste" | null) ?? "waste",
    [searchParams],
  );
  const initialTargetId = useMemo(() => searchParams.get("targetId") ?? "", [searchParams]);

  const [targetType, setTargetType] = useState<"buyer" | "farmer" | "waste">(initialType);
  const [targetId, setTargetId] = useState(initialTargetId);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const reasonOptions = useMemo(
    () =>
      ({
        buyer: [
          { value: "Spam", label: "spam" },
          { value: "Abusive behavior", label: "abusiveBehavior" },
          { value: "Fraud concern", label: "fraudConcern" },
          { value: "Other", label: "other" },
        ],
        farmer: [
          { value: "Spam", label: "spam" },
          { value: "Fake identity", label: "fakeIdentity" },
          { value: "Low quality listing", label: "lowQualityListing" },
          { value: "Other", label: "other" },
        ],
        waste: [
          { value: "Misleading details", label: "misleadingDetails" },
          { value: "Poor quality", label: "poorQuality" },
          { value: "Wrong category", label: "wrongCategory" },
          { value: "Other", label: "other" },
        ],
      }) as const,
    [],
  );

  const handleSubmit = async () => {
    if (!targetId || !reason) {
      toast.error(t("toast.required"));
      return;
    }

    try {
      await createReport({
        targetType,
        targetId,
        reason,
        description,
      }).unwrap();

      toast.success(t("toast.success"));
      router.push("/");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : t("toast.error");

      toast.error(message);
    }
  };

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
            <CardDescription>{t("auth.description")}</CardDescription>
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
      <div className="mx-auto max-w-2xl">
        <Card className="border-slate-200/60 bg-white shadow-sm">
          <CardHeader>
            <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              {t("badge")}
            </div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>{t("fields.reportType")}</Label>
              <Select value={targetType} onValueChange={(value) => setTargetType(value as "buyer" | "farmer" | "waste")}>
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.reportType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">{t("types.buyer")}</SelectItem>
                  <SelectItem value="farmer">{t("types.farmer")}</SelectItem>
                  <SelectItem value="waste">{t("types.waste")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("fields.targetId")}</Label>
              <Input
                value={targetId}
                onChange={(event) => setTargetId(event.target.value)}
                placeholder={t("placeholders.targetId")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("fields.reason")}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.reason")} />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions[targetType].map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {t(`reasons.${targetType}.${entry.label}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("fields.extraDetails")}</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("placeholders.extraDetails")}
                rows={5}
              />
            </div>

            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? t("actions.submitting") : t("actions.submit")}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                {t("actions.cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

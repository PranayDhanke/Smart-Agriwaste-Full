"use client";

import { useMemo, useState } from "react";
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

const reasonsByType = {
  buyer: ["Spam", "Abusive behavior", "Fraud concern", "Other"],
  farmer: ["Spam", "Fake identity", "Low quality listing", "Other"],
  waste: ["Misleading details", "Poor quality", "Wrong category", "Other"],
} as const;

export default function ReportPage() {
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

  const handleSubmit = async () => {
    if (!targetId || !reason) {
      toast.error("Target and reason are required.");
      return;
    }

    try {
      await createReport({
        targetType,
        targetId,
        reason,
        description,
      }).unwrap();

      toast.success("Report submitted successfully.");
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
          : "Unable to submit report.";

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
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need to sign in before you can submit a moderation report.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/sign-in")}>Go to sign in</Button>
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
              Moderation report
            </div>
            <CardTitle>Report a buyer, farmer, or waste listing</CardTitle>
            <CardDescription>
              Submit a report if something looks suspicious, misleading, abusive, or poor quality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Report type</Label>
              <Select value={targetType} onValueChange={(value) => setTargetType(value as "buyer" | "farmer" | "waste")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="waste">Waste listing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target ID</Label>
              <Input
                value={targetId}
                onChange={(event) => setTargetId(event.target.value)}
                placeholder="Paste the buyer, farmer, or waste ID"
              />
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasonsByType[targetType].map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {entry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Extra details</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional explanation for the admin team"
                rows={5}
              />
            </div>

            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit report"}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

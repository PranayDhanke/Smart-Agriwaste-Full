"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBootstrapAdminMutation } from "@/redux/api/adminApi";

export default function AdminSignInPage() {
  const router = useRouter();
  const t = useTranslations("admin.signIn");
  const { isLoaded, isSignedIn, user } = useUser();
  const [bootstrapAdmin, { isLoading }] = useBootstrapAdminMutation();

  const role = user?.unsafeMetadata?.role;

  const enableAdminAccess = async () => {
    try {
      await bootstrapAdmin().unwrap();
      await user?.reload();
      toast.success(t("toast.accessEnabled"));
      router.replace("/profile/admin");
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
          : t("toast.unableToEnable");

      toast.error(message);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {t("loading")}
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f7fdf8_0%,#eaf8ee_100%)] px-4">
        <div className="w-full max-w-md rounded-3xl border border-green-200 bg-white/90 p-4 shadow-xl">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">
              {t("signedOut.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {t("signedOut.description")}
            </p>
          </div>
          <SignIn signUpUrl="/selectSignUp" forceRedirectUrl="/admin/sign-in" />
        </div>
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f7fdf8_0%,#eaf8ee_100%)] px-4">
        <Card className="w-full max-w-lg border-green-100">
          <CardHeader>
            <CardTitle>{t("active.title")}</CardTitle>
            <CardDescription>{t("active.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={() => router.push("/profile/admin")}>
              {t("active.openPanel")}
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              {t("active.backHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f7fdf8_0%,#eaf8ee_100%)] px-4">
      <Card className="w-full max-w-lg border-green-100">
        <CardHeader>
          <CardTitle>{t("enable.title")}</CardTitle>
          <CardDescription>{t("enable.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {t("enable.signedInAs")}{" "}
            <span className="font-medium text-slate-900">
              {user.primaryEmailAddress?.emailAddress}
            </span>
          </div>
          <div className="flex gap-3">
            <Button onClick={enableAdminAccess} disabled={isLoading}>
              {isLoading ? t("enable.buttonLoading") : t("enable.button")}
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              {t("enable.cancel")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

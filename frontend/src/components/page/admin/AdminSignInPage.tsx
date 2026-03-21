"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "@/i18n/navigation";
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
  const { isLoaded, isSignedIn, user } = useUser();
  const [bootstrapAdmin, { isLoading }] = useBootstrapAdminMutation();

  const role = user?.unsafeMetadata?.role;

  const enableAdminAccess = async () => {
    try {
      await bootstrapAdmin().unwrap();
      await user?.reload();
      toast.success("Admin access enabled");
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
          : "Unable to enable admin access";

      toast.error(message);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f7fdf8_0%,#eaf8ee_100%)] px-4">
        <div className="w-full max-w-md rounded-3xl border border-green-200 bg-white/90 p-4 shadow-xl">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">
              Admin Login
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in with an approved account to unlock the admin control
              panel.
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
            <CardTitle>Admin access active</CardTitle>
            <CardDescription>
              Your account already has admin privileges. Open the panel to
              manage the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={() => router.push("/profile/admin")}>
              Open Admin Panel
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Back Home
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
          <CardTitle>Enable admin privileges</CardTitle>
          <CardDescription>
            If this email is included in the server allowlist, you can
            bootstrap admin access here and open the moderation dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Signed in as{" "}
            <span className="font-medium text-slate-900">
              {user.primaryEmailAddress?.emailAddress}
            </span>
          </div>
          <div className="flex gap-3">
            <Button onClick={enableAdminAccess} disabled={isLoading}>
              {isLoading ? "Enabling..." : "Enable Admin Access"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

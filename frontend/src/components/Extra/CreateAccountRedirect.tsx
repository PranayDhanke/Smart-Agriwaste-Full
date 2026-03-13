"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useTranslations } from "next-intl";

const CreateAccountRedirect = () => {
  const router = useRouter();
  const { user } = useUser();

  const clerkRole = user?.unsafeMetadata.role;
  const t = useTranslations("extra");

  useEffect(() => {
    if (user) {
      router.push(`/create-account/${clerkRole}`);
    }
  }, [clerkRole, router , user]);
  return (
    <div className="h-screen animate-collapsible-up">
      {t("CreateAccountRedirect.loading")}
    </div>
  );
};

export default CreateAccountRedirect;

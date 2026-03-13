"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const CreateAccountRedirect = () => {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();

  const roleFromUrl = searchParams.get("role") || "user";

  useEffect(() => {
    const setRole = async () => {
      if (user) {
        await user.update({
          unsafeMetadata: {
            role: roleFromUrl,
          },
        });

        router.push(`/create-account/${roleFromUrl}`);
      }
    };

    setRole();
  }, [user, roleFromUrl, router]);

  return <div className="h-screen">Loading...</div>;
};

export default CreateAccountRedirect;
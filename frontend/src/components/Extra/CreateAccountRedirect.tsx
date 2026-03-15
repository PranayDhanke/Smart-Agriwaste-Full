"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const CreateAccountRedirect = () => {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const searchParams = useSearchParams();

  const role = searchParams.get("role") || "user";

  let localRole = "user";

  useEffect(() => {
    localRole = localStorage.getItem("role") || "user";
  }, [user]);

  useEffect(() => {
    const setRole = async () => {
      if (!isLoaded || !user) return;
      if (!user.unsafeMetadata?.role) {
        await user.update({
          unsafeMetadata: { role: role === "user" ? localRole : role },
        });
      }

      router.replace(`/create-account/${role === "user" ? localRole : role}`);
    };

    setTimeout(() => {
      setRole();
    }, 200);
  }, [user, role, router, localRole]);

  return <div className="h-screen">Loading...</div>;
};

export default CreateAccountRedirect;

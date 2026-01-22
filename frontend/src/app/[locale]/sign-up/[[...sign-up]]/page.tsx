"use client";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "user";

  useEffect(() => {
    localStorage.setItem("roleItem", role);
  });

  return (
    <div className="flex my-5 justify-center items-center">
      <SignUp
        unsafeMetadata={{ role }}
        // pass role explicitly as query param so create-account can always read it
        afterSignUpUrl={`/create-account`}
        signInUrl="/sign-in"
      />
    </div>
  );
}

"use client";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "user";

  return (
    <div className="flex my-5 justify-center items-center">
      <SignUp
        // pass role explicitly as query param so create-account can always read it
        afterSignUpUrl={`/create-account?role=${role}`}
        signInUrl="/sign-in"
      />
    </div>
  );
}

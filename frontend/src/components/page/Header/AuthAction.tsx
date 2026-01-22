"use client";

import { useUser } from "@clerk/nextjs";
import SignedInActions from "./SignedInActions";
import SignedOutActions from "./SignedOutActions";

export default function AuthActions() {
  const { isSignedIn , user } = useUser();

  if (!isSignedIn) return <SignedOutActions />;

  return <SignedInActions id={user.id} />;
}

"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { LocalizationResource } from "@clerk/types";
import { AuthProvider } from "@/components/Extra/AuthProvider";
import Footer from "@/components/page/home/Footer";
import Header from "@/components/page/Header/Header";
import OneSignalProvider from "@/components/provider/OneSignalProvider";
import FloatingCart from "@/components/page/marketplace/FlotingCart";

export default function Providers({
  children,
  clerkLocale,
}: {
  children: React.ReactNode;
  clerkLocale: LocalizationResource;
}) {
  return (
    <Provider store={store}>
      <ClerkProvider
        localization={clerkLocale}
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        <Toaster position="top-center" />
        <OneSignalProvider />
        <Header />
        <AuthProvider />
        {children}
        <FloatingCart />
        <Footer />
      </ClerkProvider>
    </Provider>
  );
}

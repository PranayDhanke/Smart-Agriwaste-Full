import OneSignal from "react-onesignal";

declare global {
  interface Window {
    isInitialized?: boolean;
  }
}

export async function initOneSignal() {
  if (typeof window === "undefined") return;
  if (window.isInitialized) return;

  await OneSignal.init({
    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
    allowLocalhostAsSecureOrigin: true,
  });

  window.isInitialized = true;
}

export async function loginOneSignal(userId: string) {
  if (!window.isInitialized) {
    await initOneSignal();
  }

  await OneSignal.login(userId);
}

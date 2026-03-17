import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "next-pwa";

const withNextIntl = createNextIntlPlugin();

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",

  importScripts: ["/OneSignalSDKWorker.js"],

  runtimeCaching: [
    {
      urlPattern: /^https?.*\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
      },
    },
    {
      urlPattern: /^https:\/\/ik\.imagekit\.io\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
      },
    },
  ],

  fallbacks: {
    document: "/offline",
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

export default withPWA(withNextIntl(nextConfig));

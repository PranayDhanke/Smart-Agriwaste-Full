import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
} satisfies NextConfig;

const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl(nextConfig);

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Loads translations per request from src/i18n/request.ts
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

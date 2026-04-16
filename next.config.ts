import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*", // Allows all ngrok domains
  ],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/workflows",
        permanent: false,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "shakurs-thing",
  project: "nodebase",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});

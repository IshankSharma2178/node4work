import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,

  serverExternalPackages: ["@prisma/client"],
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*", // Allows all ngrok domains
  ],
    productionBrowserSourceMaps: false,

  experimental: {
    // 2. Reduce the concurrent workers if your build machine is bottlenecked
    cpus: 2, 
    workerThreads: false,
  },
  
  // 3. Optional: If you use a separate tool (like GitHub Actions) for type-checking,
  // you can skip it here to bypass the heavy memory usage phase shown in your logs.
  typescript: {
    ignoreBuildErrors: true,
  },
};

const enableSentry = !!process.env.SENTRY_AUTH_TOKEN;

export default enableSentry
  ? withSentryConfig(nextConfig, {
      org: "shakurs-thing",
      project: "nodebase",
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : nextConfig;

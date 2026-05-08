import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright runs on server-side only, mark it as external
  serverExternalPackages: ["playwright"],

  // Increase API route timeout for long-running automation
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

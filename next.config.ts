import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      // Public gateway paths per docs/ARCHITECTURE.md §7 and README.
      { source: "/v1/admin/:path*", destination: "/api/admin/:path*" },
      { source: "/v1/:path*", destination: "/api/v1/:path*" },
    ];
  },
};

export default nextConfig;

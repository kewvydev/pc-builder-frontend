import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow loading images from any remote host (dev convenience). For tighter
    // control in production, replace the wildcard with your approved hosts.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;

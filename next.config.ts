import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "getaqszizmsichgdnkvp.supabase.co",
      },
    ],
  },
};

export default nextConfig;

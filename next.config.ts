import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "uzdrrelxsjtvjvqbxcfy.supabase.co",
      },
    ],
  },
};

// Cloudflare dev runtime removed — using Vercel for deployment

export default nextConfig;

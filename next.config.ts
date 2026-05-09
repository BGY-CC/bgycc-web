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

// Only initialise the Cloudflare dev bindings when running locally.
// On Vercel (and CI) the `workerd` binary is unavailable, so calling this
// unconditionally would crash `next build`.
if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
  // Dynamic import so the module is never loaded on non-Cloudflare hosts.
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}

export default nextConfig;

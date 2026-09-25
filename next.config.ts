import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
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
  async headers() {
    // Cloudflare Workers (OpenNext) often needs 'unsafe-eval' for WebAssembly
    // and edge-runtime codebundles; kept to avoid breaking the production build.
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob: https://images.unsplash.com https://uzdrrelxsjtvjvqbxcfy.supabase.co",
                "font-src 'self' data:",
                "connect-src 'self' https://uzdrrelxsjtvjvqbxcfy.supabase.co",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "object-src 'none'",
                "upgrade-insecure-requests",
              ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

// Deployed to Cloudflare Workers via OpenNext (see wrangler.jsonc + open-next.config.ts)

export default nextConfig;

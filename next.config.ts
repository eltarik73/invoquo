import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.vercel.app https://*.bativio.fr https://*.klikandgo.app http://localhost:* https://localhost:*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

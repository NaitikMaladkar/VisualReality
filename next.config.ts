import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return {
      // Serve the pure static pages from /public at pretty URLs
      beforeFiles: [
        { source: "/", destination: "/index.html" },
        { source: "/city", destination: "/city.html" },
        { source: "/timeline", destination: "/timeline.html" },
        { source: "/carbon", destination: "/carbon.html" },
        { source: "/museum", destination: "/museum.html" },
        { source: "/impact", destination: "/impact.html" },
        { source: "/challenge", destination: "/challenge.html" },
        { source: "/balance", destination: "/balance.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;

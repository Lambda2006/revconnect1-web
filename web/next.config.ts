import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  transpilePackages: ["mapbox-gl"],
  images: {
    remotePatterns: [],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  disable: true, // Temporarily disabled — sw.js _async_to_generator transpilation bug
  // No custom workboxOptions — Workbox defaults don't cache POST requests,
  // so /api/agent is never intercepted by the service worker.
})(nextConfig);

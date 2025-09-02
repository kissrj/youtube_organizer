import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration to help resolve App Router / Pages Router conflicts
  trailingSlash: false,
  // Use App Router as primary
  experimental: {
    // This might help with route conflicts
  },
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
};

export default nextConfig;

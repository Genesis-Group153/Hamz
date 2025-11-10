import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  // Ensure environment variables are available during build
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.genesistickets.net/',
  },
  // Skip static optimization for pages that use API calls
  output: 'standalone',
  // Disable static optimization for dynamic routes
  experimental: {
    // This helps with build-time issues
  },
};

export default nextConfig;

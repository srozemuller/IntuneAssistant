import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Removed 'output: export' to support dynamic routes
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    // Enable standalone output for better deployment
    output: 'standalone',
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Removed 'output: export' to support dynamic routes
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    // Enable standalone output for better deployment
    output: 'standalone',
    // Pin the workspace root so Turbopack doesn't guess wrong now that the repo root also
    // has its own package.json/yarn.lock (for the `yarn dev` orchestration script).
    turbopack: {
        root: __dirname,
    },
};

export default nextConfig;

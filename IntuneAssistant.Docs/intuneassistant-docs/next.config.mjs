import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // Remove output: 'export' to enable API routes
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
};

export default withMDX(config);
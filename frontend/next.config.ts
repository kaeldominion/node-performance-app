import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Fix workspace root warning - set explicit root for Turbopack
  experimental: {
    turbo: {
      root: path.join(__dirname),
    },
  },
};

export default nextConfig;

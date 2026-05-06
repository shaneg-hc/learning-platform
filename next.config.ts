import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Azurite local storage emulator (dev)
      { protocol: 'http', hostname: '127.0.0.1', port: '10000' },
      // Azure Blob Storage (prod)
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
      // Azure CDN endpoint (prod)
      { protocol: 'https', hostname: '*.azureedge.net' },
    ],
  },
};

export default nextConfig;

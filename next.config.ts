import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Config strictly locked down to local assets for enterprise security
  images: {
    unoptimized: true, // Recommended when exporting as a standalone SaaS instance
  },
};

export default nextConfig;

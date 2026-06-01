import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Enable static export
  trailingSlash: true, // Enable trailing slashes for clean static routing
};

export default nextConfig;

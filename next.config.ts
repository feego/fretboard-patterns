import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Enable Turbopack (Next.js 16 default) alongside a webpack hook used by plugins
  // This silences the build error about having a webpack config with no turbopack config
  turbopack: {},
  webpack: (config, { isServer: _isServer }) => {
    // Ensure we're using webpack, and allow future customizations
    return config;
  },
};
const withVanillaExtract = createVanillaExtractPlugin();
export default withVanillaExtract(nextConfig);

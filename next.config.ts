import type { NextConfig } from "next";
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";

const withVanillaExtract = createVanillaExtractPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  webpack: (config, { isServer }) => {
    // Ensure we're using webpack, not turbopack
    return config;
  },
};

export default withVanillaExtract(nextConfig);

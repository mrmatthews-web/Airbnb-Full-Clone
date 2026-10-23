import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname, "../..") },
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  // The optimiser intentionally does not forward Basic auth credentials to
  // source images. Serve these small local demo assets directly behind the gate.
  images: { unoptimized: true, remotePatterns: [] },
};
export default nextConfig;

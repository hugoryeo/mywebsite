import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // The parent repo has its own package-lock.json one level up; pin the
  // workspace root to this app so Turbopack doesn't guess wrong.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // The desktop build (scripts/build-desktop.mjs) ships `.next/standalone` as
  // the server: a self-contained directory with only the node_modules the app
  // actually reached for, instead of the ~700MB install tree. `next start`
  // behaves the same either way, so this is on for every build.
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;

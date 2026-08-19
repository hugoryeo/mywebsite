import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // The parent repo has its own package-lock.json one level up; pin the
  // workspace root to this app so Turbopack doesn't guess wrong.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

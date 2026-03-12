import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/**": [path.join(__dirname, "data", "tributario_tjsp.db")],
  },
};

export default nextConfig;

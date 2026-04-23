import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Pin Next's workspace root to this project so it doesn't get confused by
  // a stray package-lock.json higher up in C:\Users\geron\.
  outputFileTracingRoot: __dirname,
};

export default withNextIntl(nextConfig);

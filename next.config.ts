import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // typedRoutes intentionally OFF: it rejects template-literal paths like
  // `${localePrefix}/survey` even when they're locale-aware and correct.
  // Re-enable once all redirect()/Link href call sites move to the
  // next-intl `redirect`/`Link` helpers from src/i18n/navigation.ts —
  // those are routing-aware and produce typedRoutes-compatible literals.
  // Pin Next's workspace root to this project so it doesn't get confused by
  // a stray package-lock.json higher up in C:\Users\geron\.
  outputFileTracingRoot: __dirname,
};

export default withNextIntl(nextConfig);

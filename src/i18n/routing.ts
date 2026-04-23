import { defineRouting } from "next-intl/routing";

/**
 * i18n configuration.
 * - FR is the primary locale (no URL prefix).
 * - EN is the fallback (prefixed: /en/...).
 */
export const routing = defineRouting({
  locales: ["fr", "en"] as const,
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

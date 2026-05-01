import { defineRouting } from "next-intl/routing";

/**
 * i18n configuration.
 * - FR is the primary locale (no URL prefix) — Vaud schools, primary audience.
 * - DE is for Berne / German-speaking Swiss schools (prefixed: /de/...).
 * - IT is for Ticino / Italian-speaking Swiss schools (prefixed: /it/...).
 * - EN is the international fallback (prefixed: /en/...).
 */
export const routing = defineRouting({
  locales: ["fr", "de", "it", "en"] as const,
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

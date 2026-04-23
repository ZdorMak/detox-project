"use client";

import { useTranslations } from "next-intl";

/**
 * Non-stigmatising resources block shown on the result page.
 * Links validated 2026-04-23 — replace if domains change.
 * Marked client-side because `useTranslations` is a client hook.
 */
export function ResourcesBlock() {
  const t = useTranslations("results.resources");

  const items: Array<{ key: string; href: string }> = [
    { key: "proJuventute", href: "https://www.projuventute.ch/fr/conseils/aide-en-ligne-147" },
    { key: "promotionSante", href: "https://promotionsante.ch/" },
    { key: "stopAddiction", href: "https://www.addictionsuisse.ch/" },
    { key: "ciaoCh", href: "https://www.ciao.ch/" },
  ];

  return (
    <section
      className="mt-10 rounded-lg border border-border bg-card p-6"
      aria-labelledby="resources-heading"
    >
      <h2 id="resources-heading" className="text-lg font-semibold">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      <ul className="mt-4 space-y-3">
        {items.map(({ key, href }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline gap-2 text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              <span className="font-medium">{t(`items.${key}.name` as const)}</span>
              <span className="text-xs text-muted-foreground">
                — {t(`items.${key}.description` as const)}
              </span>
              <span aria-hidden="true" className="text-muted-foreground">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

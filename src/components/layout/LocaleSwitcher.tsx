"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<Locale, { short: string; long: string }> = {
  fr: { short: "FR", long: "Français" },
  de: { short: "DE", long: "Deutsch" },
  it: { short: "IT", long: "Italiano" },
  en: { short: "EN", long: "English" },
};

/**
 * Compact 4-locale picker shown in the site header.
 *
 * Uses next-intl's locale-aware router to swap the current path's
 * locale segment in place — clicking DE on `/jeu` takes you to `/de/jeu`,
 * clicking FR on `/de/jeu` takes you back to `/jeu` (FR has no prefix).
 *
 * Pure pill/segmented control — no dropdown — so the active locale is
 * always visible at a glance, important for multilingual Swiss schools.
 * The leading globe icon makes the purpose unambiguous in any language.
 */
export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === currentLocale || isPending) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      role="radiogroup"
      aria-label="Langue / Sprache / Lingua / Language"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5 sm:pl-2 shadow-sm",
        isPending && "opacity-70",
      )}
    >
      <Globe
        className="hidden h-3.5 w-3.5 text-muted-foreground sm:block"
        aria-hidden="true"
      />
      {routing.locales.map((loc) => {
        const { short, long } = LOCALE_LABELS[loc];
        const active = loc === currentLocale;
        return (
          <button
            key={loc}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={long}
            title={long}
            onClick={() => choose(loc)}
            disabled={isPending}
            className={cn(
              "flex h-7 min-w-[2rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}

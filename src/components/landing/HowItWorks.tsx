import { useTranslations } from "next-intl";
import { Play, Heart, Award } from "lucide-react";

/**
 * Three-step walkthrough between the hero and the pillars: tells visitors
 * what they're about to do without forcing them to scroll the whole page.
 *
 * Each step has its own accent colour, a numbered badge, and a Lucide icon.
 * No CTAs here — the hero already has them; this section is purely
 * "what's it about?".
 */
export function HowItWorks() {
  const t = useTranslations("landing.how");
  const steps = [
    {
      key: "experience",
      Icon: Play,
      accent: "from-indigo-500 to-violet-500",
      tint: "bg-indigo-50 dark:bg-indigo-950/30",
      iconBg: "bg-indigo-500",
    },
    {
      key: "survey",
      Icon: Heart,
      accent: "from-rose-500 to-orange-500",
      tint: "bg-rose-50 dark:bg-rose-950/30",
      iconBg: "bg-rose-500",
    },
    {
      key: "challenge",
      Icon: Award,
      accent: "from-emerald-500 to-teal-500",
      tint: "bg-emerald-50 dark:bg-emerald-950/30",
      iconBg: "bg-emerald-500",
    },
  ] as const;

  return (
    <section
      aria-labelledby="how-heading"
      className="relative isolate overflow-hidden border-y border-border bg-background py-20 sm:py-28"
    >
      {/* Decorative blur blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl"
      />

      <div className="container relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h2
            id="how-heading"
            className="mt-3 text-balance text-3xl font-bold leading-tight sm:text-5xl"
          >
            {t("title")}
          </h2>
        </div>

        <ol className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map(({ key, Icon, accent, tint, iconBg }, i) => (
            <li key={key} className="relative">
              <div
                className={`group relative flex h-full flex-col rounded-2xl border border-border ${tint} p-6 transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg} shadow-md`}
                  >
                    <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                  </div>
                  <span
                    className={`bg-gradient-to-r ${accent} bg-clip-text font-display text-4xl font-bold leading-none text-transparent`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-xl font-bold leading-tight">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${key}.description`)}
                </p>
                <div
                  className={`mt-6 h-1 w-12 rounded-full bg-gradient-to-r ${accent}`}
                  aria-hidden="true"
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

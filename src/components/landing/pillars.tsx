import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  Brain,
  Users,
  Sparkles,
  Smartphone,
  Atom,
  Accessibility,
  type LucideIcon,
} from "lucide-react";

interface PillarSpec {
  key: string;
  Icon: LucideIcon;
  /** Tailwind colour class for the icon (text). */
  iconText: string;
  /** Soft background tint for the icon halo. */
  iconHalo: string;
  /** Border + accent stripe colour. */
  accentBorder: string;
  /** Top stripe gradient. */
  stripe: string;
}

const PILLARS: PillarSpec[] = [
  {
    key: "durable",
    Icon: ShieldCheck,
    iconText: "text-pillar-durable",
    iconHalo: "bg-teal-50 dark:bg-teal-950/40",
    accentBorder: "border-teal-200 dark:border-teal-900",
    stripe: "from-teal-500 to-teal-300",
  },
  {
    key: "addiction",
    Icon: Brain,
    iconText: "text-pillar-addiction",
    iconHalo: "bg-red-50 dark:bg-red-950/40",
    accentBorder: "border-red-200 dark:border-red-900",
    stripe: "from-red-500 to-red-300",
  },
  {
    key: "collaboration",
    Icon: Users,
    iconText: "text-pillar-collab",
    iconHalo: "bg-violet-50 dark:bg-violet-950/40",
    accentBorder: "border-violet-200 dark:border-violet-900",
    stripe: "from-violet-500 to-violet-300",
  },
  {
    key: "innovation",
    Icon: Sparkles,
    iconText: "text-pillar-innovation",
    iconHalo: "bg-sky-50 dark:bg-sky-950/40",
    accentBorder: "border-sky-200 dark:border-sky-900",
    stripe: "from-sky-500 to-sky-300",
  },
  {
    key: "smartphone",
    Icon: Smartphone,
    iconText: "text-pillar-smartphone",
    iconHalo: "bg-lime-50 dark:bg-lime-950/40",
    accentBorder: "border-lime-200 dark:border-lime-900",
    stripe: "from-lime-500 to-lime-300",
  },
  {
    key: "interdisciplinaire",
    Icon: Atom,
    iconText: "text-pillar-interdisciplinaire",
    iconHalo: "bg-amber-50 dark:bg-amber-950/40",
    accentBorder: "border-amber-200 dark:border-amber-900",
    stripe: "from-amber-500 to-amber-300",
  },
  {
    key: "accessible",
    Icon: Accessibility,
    iconText: "text-pillar-accessible",
    iconHalo: "bg-cyan-50 dark:bg-cyan-950/40",
    accentBorder: "border-cyan-200 dark:border-cyan-900",
    stripe: "from-cyan-500 to-cyan-300",
  },
];

export function Pillars() {
  const t = useTranslations("landing.pillars");

  return (
    <section
      id="pillars"
      aria-labelledby="pillars-heading"
      className="bg-grain"
    >
      <div className="container mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            7 piliers
          </p>
          <h2
            id="pillars-heading"
            className="mt-3 text-balance text-3xl font-bold leading-tight sm:text-5xl"
          >
            {t("title")}
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <ul
          role="list"
          className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PILLARS.map(({ key, Icon, iconText, iconHalo, accentBorder, stripe }, i) => (
            <li key={key}>
              <article
                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${accentBorder}`}
              >
                {/* Top stripe in pillar colour */}
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${stripe}`}
                  aria-hidden="true"
                />

                {/* Icon halo */}
                <div className="relative mt-2 flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconHalo} transition-transform duration-300 group-hover:scale-110`}
                    aria-hidden="true"
                  >
                    <Icon className={`h-7 w-7 ${iconText}`} strokeWidth={1.75} />
                  </div>
                  <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="font-display mt-4 text-xl font-bold leading-tight">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${key}.description`)}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

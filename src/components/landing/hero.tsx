import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { HeroVideo } from "./HeroVideo";

/**
 * Hero — first impression. Full-bleed cinematic video with the headline
 * as overlay text on top, CTA stack underneath. Mobile-first, ambient.
 */
export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative isolate overflow-hidden">
      {/* Full-width video as the backdrop */}
      <div className="relative">
        <HeroVideo />

        {/* Gradient overlay — readability + cinematic */}
        <div
          className="pointer-events-none absolute inset-0 mx-auto max-w-3xl rounded-2xl bg-gradient-to-b from-black/30 via-black/10 to-black/70"
          aria-hidden="true"
        />

        {/* Eyebrow + Headline overlay (centered) */}
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-3xl flex-col justify-end p-6 text-white sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-200/90 drop-shadow">
            {t("eyebrow")}
          </p>
          <h1 className="font-display mt-2 text-balance text-3xl font-bold leading-[1.05] drop-shadow-lg sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
        </div>
      </div>

      {/* Subtitle + CTA stack underneath */}
      <div className="container mx-auto max-w-3xl px-4 pb-16 pt-8 text-center sm:pb-20">
        <p className="mx-auto max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-teal-600 shadow-lg shadow-primary/20 hover:from-primary/90 hover:to-teal-600/90 hover:shadow-xl sm:w-auto sm:px-8"
          >
            <Link href="/experience">{t("cta")}</Link>
          </Button>
          <p className="text-xs text-muted-foreground">{t("ctaSubtitle")}</p>
          <Button asChild variant="link" size="sm" className="mt-1">
            <Link href="/jeu">{t("ctaSecondary")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

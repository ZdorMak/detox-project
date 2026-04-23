import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Hero — first impression. Mobile-first, big CTA, tight copy.
 */
export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto">
            {/* /survey route is added in Week 2; for now CTA points at #pillars
                so click is never a dead end. */}
            <Link href="#pillars">{t("cta")}</Link>
          </Button>
          <p className="text-xs text-muted-foreground">{t("ctaSubtitle")}</p>
        </div>
      </div>
    </section>
  );
}

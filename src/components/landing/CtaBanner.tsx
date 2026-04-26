import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

/**
 * Closing CTA banner — last thing visitors see before the footer. Big,
 * confident, dark, with a single primary action and one secondary link.
 */
export function CtaBanner() {
  const t = useTranslations("landing.ctaBanner");

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 py-20 text-white sm:py-28">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-teal-500/30 blur-3xl"
      />

      <div className="container relative mx-auto max-w-3xl px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300/80">
          {t("eyebrow")}
        </p>
        <h2 className="font-display mt-4 text-balance text-4xl font-bold leading-tight sm:text-6xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-white/80">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full bg-white text-slate-900 shadow-xl hover:bg-white/90 sm:w-auto sm:px-8"
          >
            <Link href="/experience">
              {t("primary")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto sm:px-8"
          >
            <Link href="/jeu">{t("secondary")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

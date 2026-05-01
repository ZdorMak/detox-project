import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroVideo } from "@/components/landing/HeroVideo";

/**
 * Hero — cinematic video card with editorial typography overlay.
 *
 * The HeroVideo component plays a curated stock-clip playlist (autoplay,
 * muted, with crossfade) inside a rounded 16:9 card. We layer the eyebrow
 * + italic display headline on top of a dark gradient so the copy stays
 * readable across all clips. Below the card sits the subtitle and the
 * two CTAs (primary → experience, secondary → cards).
 *
 * The video itself is `aria-hidden` (it's decorative); all meaningful
 * content lives in the text layer for screen readers.
 */
export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative isolate overflow-hidden">
      {/* Ambient glow + grain — keeps the page coherent with later sections. */}
      <div className="cd-glow absolute inset-0 -z-10" aria-hidden="true" />
      <div className="cd-grain absolute inset-0 -z-10" aria-hidden="true" />

      <div
        className="mx-auto flex max-w-[1200px] flex-col items-center gap-10 px-[var(--pad-x)] pb-20 pt-10 md:gap-14 md:pt-16"
      >
        {/* Video card with overlaid headline. */}
        <div className="relative w-full">
          <HeroVideo />

          {/* Text layer — bottom-left over a dark gradient. */}
          <div className="pointer-events-none absolute inset-0 flex items-end rounded-2xl">
            <div
              className="w-full rounded-b-2xl px-6 pb-8 pt-24 md:px-10 md:pb-12 md:pt-32"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgb(0 0 0 / 0.55) 60%, rgb(0 0 0 / 0.78) 100%)",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="h-px w-6"
                  style={{ background: "var(--cd-accent)" }}
                />
                <span
                  className="cd-mono"
                  style={{ color: "var(--cd-accent)" }}
                >
                  {t("eyebrow")}
                </span>
              </div>
              <h1
                className="font-display max-w-[18ch] text-balance leading-[0.96]"
                style={{
                  fontSize: "clamp(40px, 6.5vw, 96px)",
                  letterSpacing: "-0.03em",
                  color: "oklch(0.98 0.005 80)",
                }}
              >
                <span className="block">{t("titlePart1")}</span>
                <span
                  className="block italic"
                  style={{ color: "var(--cd-accent)", paddingLeft: "0.4em" }}
                >
                  {t("titlePart2")}
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Below the card: subtitle + CTAs, centered for clarity. */}
        <div className="flex w-full max-w-[720px] flex-col items-center gap-6 text-center">
          <p
            className="m-0 text-pretty text-lg leading-relaxed"
            style={{ color: "var(--fg-2)" }}
          >
            {t("subtitle")}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link href="/experience" className="cd-btn cd-btn-primary cd-btn-lg">
              {t("cta")} <span aria-hidden="true">→</span>
            </Link>
            <p className="cd-mono cd-dim">{t("ctaSubtitle")}</p>
          </div>
          <Link
            href="/jeu"
            className="text-base underline-offset-4 hover:underline"
            style={{ color: "var(--cd-accent)" }}
          >
            {t("ctaSecondary")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

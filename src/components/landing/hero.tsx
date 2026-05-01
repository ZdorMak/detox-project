import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroVideo } from "@/components/landing/HeroVideo";

/**
 * Hero — cinematic video card with editorial typography overlay.
 *
 * Layout (desktop):
 *   [eyebrow strip + mono label across the top]
 *   [big 16:9 video card — fills content width, bottom-left text pocket]
 *   [two-column: subtitle ┃ CTAs]
 *   [scroll indicator at the very bottom]
 *
 * The video itself is `aria-hidden` (decorative); all meaningful copy
 * lives in the text layer for screen readers and search engines.
 */
export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative isolate overflow-hidden">
      {/* Ambient glow + grain — anchors hero into the rest of the page palette. */}
      <div className="cd-glow absolute inset-0 -z-10" aria-hidden="true" />
      <div className="cd-grain absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-[var(--pad-x)] pb-24 pt-10 md:gap-16 md:pt-14">
        {/* Video card — fills the container, holds the title in a bottom-left pocket. */}
        <div className="relative">
          <HeroVideo
            className="max-w-none aspect-[4/3] sm:aspect-[16/9]"
            hideProgressDots
          />

          {/* Soft vignette so the title pocket reads on any clip. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(180deg, rgb(0 0 0 / 0.15) 0%, rgb(0 0 0 / 0) 35%, rgb(0 0 0 / 0) 50%, rgb(0 0 0 / 0.55) 88%, rgb(0 0 0 / 0.82) 100%), radial-gradient(ellipse at bottom left, rgb(0 0 0 / 0.6) 0%, transparent 60%)",
            }}
          />

          {/* Title pocket — bottom-left, generous editorial whitespace. */}
          <div className="absolute inset-0 flex items-end p-5 md:p-10">
            <div className="max-w-[20ch] md:max-w-[28ch]">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="h-px w-8"
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
                className="font-display m-0 text-balance leading-[0.98]"
                style={{
                  fontSize: "clamp(28px, 4.2vw, 60px)",
                  letterSpacing: "-0.025em",
                  color: "oklch(0.98 0.005 80)",
                }}
              >
                <span>{t("titlePart1")} </span>
                <span
                  className="italic"
                  style={{ color: "var(--cd-accent)" }}
                >
                  {t("titlePart2")}
                </span>
              </h1>
            </div>
          </div>

          {/* Custom progress dots — bottom-right, subtle, branded. */}
          <PlaylistDots />
        </div>

        {/* Two-column footer below the card — subtitle on the left, CTAs on the right. */}
        <div
          className="grid items-end gap-10 border-t pt-10 md:grid-cols-[1.4fr_1fr]"
          style={{ borderColor: "var(--line)" }}
        >
          <p
            className="m-0 max-w-[44ch] text-pretty text-lg leading-relaxed"
            style={{ color: "var(--fg-2)" }}
          >
            {t("subtitle")}
          </p>
          <div className="flex flex-col items-start gap-4">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/experience"
                className="cd-btn cd-btn-primary cd-btn-lg"
              >
                {t("cta")} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/jeu" className="cd-btn cd-btn-ghost cd-btn-lg">
                {t("ctaSecondary")}
              </Link>
            </div>
            <p className="cd-mono cd-dim">{t("ctaSubtitle")}</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator at the bottom — animated hairline. */}
      <div
        className="absolute bottom-7 left-[var(--pad-x)] z-[3] flex items-center gap-3.5"
        style={{ color: "var(--fg-3)" }}
        aria-hidden="true"
      >
        <span
          className="relative h-px w-14 overflow-hidden"
          style={{ background: "var(--line-2)" }}
        >
          <span
            className="absolute inset-0 motion-safe:animate-[scroll-line_2.4s_ease-in-out_infinite]"
            style={{ background: "var(--cd-accent)" }}
          />
        </span>
        <span className="cd-mono">scroll</span>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes scroll-line { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`,
        }}
      />
    </section>
  );
}

/**
 * Subtle, branded clip indicator anchored to the bottom-right of the
 * video card. Five short hairlines, one of which is amber and active.
 * Purely decorative — the autoplay rotation is the source of truth.
 */
function PlaylistDots() {
  return (
    <div
      className="pointer-events-none absolute bottom-5 right-5 hidden items-center gap-2 md:flex"
      aria-hidden="true"
    >
      <span className="cd-mono" style={{ color: "rgb(255 255 255 / 0.55)" }}>
        loop
      </span>
      <span
        className="h-1 w-8 rounded-full"
        style={{ background: "var(--cd-accent)" }}
      />
      <span className="h-1 w-2 rounded-full" style={{ background: "rgb(255 255 255 / 0.4)" }} />
      <span className="h-1 w-2 rounded-full" style={{ background: "rgb(255 255 255 / 0.25)" }} />
      <span className="h-1 w-2 rounded-full" style={{ background: "rgb(255 255 255 / 0.25)" }} />
      <span className="h-1 w-2 rounded-full" style={{ background: "rgb(255 255 255 / 0.25)" }} />
    </div>
  );
}

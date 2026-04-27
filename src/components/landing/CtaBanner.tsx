import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Closing CTA — direct port of the `.cta` block. Centred, breathing accent
 * glow behind, oversized italic headline.
 */
export function CtaBanner() {
  const t = useTranslations("landing.ctaBanner");
  return (
    <section
      className="relative overflow-hidden border-t px-[var(--pad-x)] py-[140px] text-center"
      style={{ borderColor: "var(--line)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 motion-safe:animate-[glow-breathe_6s_ease-in-out_infinite]"
        style={{
          background: "radial-gradient(circle, var(--accent-soft), transparent 60%)",
        }}
      />

      <div className="relative">
        <div className="cd-mono mb-7 flex items-center justify-center gap-3.5" style={{ color: "var(--fg-3)" }}>
          <span>05</span>
          <span className="h-px w-20" style={{ background: "var(--line-2)" }} />
          <span>{t("eyebrow")}</span>
        </div>

        <h2
          className="font-display mb-7 leading-[0.95]"
          style={{
            fontSize: "clamp(56px, 9vw, 144px)",
            letterSpacing: "-0.035em",
          }}
        >
          {t("titlePart1")}
          <br />
          <em>{t("titleAccent")}</em>
        </h2>

        <p
          className="mb-11 text-lg"
          style={{ color: "var(--fg-2)" }}
        >
          {t("subtitle")}
        </p>

        <div className="inline-flex flex-wrap justify-center gap-3.5">
          <Link href="/experience" className="cd-btn cd-btn-primary cd-btn-lg">
            {t("primary")} <span aria-hidden="true">→</span>
          </Link>
          <Link href="/jeu" className="cd-btn cd-btn-ghost cd-btn-lg">
            {t("secondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}

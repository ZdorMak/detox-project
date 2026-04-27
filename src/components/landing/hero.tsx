import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Hero — direct port of the Claude Design export.
 * Editorial typography (Instrument Serif italic), grid background,
 * radial accent glow, and a stylised phone mockup on the right.
 */
export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative isolate overflow-hidden">
      {/* Strip line at top */}
      <div
        className="absolute left-[var(--pad-x)] right-[var(--pad-x)] top-6 z-[3] flex items-center gap-4"
        aria-hidden="true"
      >
        <span className="h-px w-6" style={{ background: "var(--line-2)" }} />
        <span className="cd-mono cd-dim">{t("eyebrow")}</span>
        <span
          className="ml-auto h-px flex-1"
          style={{ background: "var(--line-2)" }}
        />
      </div>

      {/* Grid + radial glow background */}
      <div className="cd-grain absolute inset-0 z-0" aria-hidden="true" />
      <div className="cd-glow absolute inset-0 z-0" aria-hidden="true" />

      <div
        className="relative z-[2] grid min-h-[calc(100vh-64px)] items-center gap-[60px] px-[var(--pad-x)] pb-20 pt-10 md:grid-cols-[1.5fr_1fr]"
      >
        {/* Left: copy */}
        <div className="max-w-[900px] pt-8">
          <h1
            className="font-display mb-14 text-balance leading-[0.92]"
            style={{
              fontSize: "clamp(56px, 8.6vw, 132px)",
              letterSpacing: "-0.035em",
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

          <div
            className="grid items-end gap-12 border-t pt-8 md:grid-cols-2"
            style={{ borderColor: "var(--line)" }}
          >
            <p
              className="m-0 max-w-[42ch] text-pretty text-lg leading-relaxed"
              style={{ color: "var(--fg-2)" }}
            >
              {t("subtitle")}
            </p>
            <div className="flex flex-col items-start gap-3.5">
              <div className="flex flex-wrap gap-3">
                <Link href="/experience" className="cd-btn cd-btn-primary cd-btn-lg">
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

        {/* Right: stylised phone */}
        <div
          className="relative z-[2] hidden self-center justify-self-center md:block"
          style={{ width: "280px", height: "560px" }}
          aria-hidden="true"
        >
          <PhoneMockup />
          {/* Glow halo behind phone */}
          <div
            className="pointer-events-none absolute inset-[-50px] -z-10 blur-2xl"
            style={{
              background:
                "radial-gradient(closest-side, var(--accent-glow), transparent 70%)",
              animation: "glow-breathe 4s ease-in-out infinite",
            }}
          />
          {/* Counter chip */}
          <div
            className="absolute right-[-40px] top-[60px] rotate-[4deg] rounded-[10px] border px-4 py-3.5 shadow-2xl"
            style={{
              background: "var(--bg-2)",
              borderColor: "var(--line-2)",
            }}
          >
            <div
              className="font-display text-5xl leading-none"
              style={{ color: "var(--cd-accent)", letterSpacing: "-0.04em" }}
            >
              0
            </div>
            <div className="cd-mono cd-dim mt-0.5">{t("phoneCounterLabel")}</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
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

function PhoneMockup() {
  return (
    <div
      className="relative h-full w-full -rotate-[5deg] rounded-[42px] border p-3.5"
      style={{
        background: "oklch(0.10 0.01 265)",
        borderColor: "var(--line-2)",
        boxShadow:
          "inset 0 1px 0 oklch(1 0 0 / 0.06), 0 60px 100px -30px rgb(0 0 0 / 0.7), 0 0 0 7px oklch(0.16 0.012 265)",
      }}
    >
      {/* Notch */}
      <div
        className="absolute left-1/2 top-4 z-[2] h-6 w-[90px] -translate-x-1/2 rounded-[14px]"
        style={{ background: "#000" }}
      />
      {/* Screen */}
      <div
        className="relative flex h-full w-full flex-col gap-2.5 overflow-hidden rounded-[30px] px-4 pb-6 pt-3.5"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.12 0.01 265) 0%, oklch(0.16 0.014 265) 40%, oklch(0.20 0.014 265) 100%)",
        }}
      >
        <div className="flex justify-between pt-1 text-[10px]" style={{ color: "oklch(0.85 0.005 80)" }}>
          <span>9:41</span>
          <span className="opacity-70 tracking-widest">●●● 5G ▮</span>
        </div>
        <div
          className="font-display mt-7 text-[56px] leading-none"
          style={{
            color: "oklch(0.95 0.01 80)",
            letterSpacing: "-0.045em",
            textShadow: "0 0 40px var(--accent-glow)",
          }}
        >
          0:00
        </div>
        <div className="mb-4" style={{ color: "oklch(0.65 0.01 80)" }}>
          détox commencée
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex h-14 items-center gap-2.5 rounded-xl border px-3"
              style={{
                background: "oklch(0.22 0.015 265 / 0.7)",
                borderColor: "oklch(0.30 0.015 265 / 0.6)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                className="h-7 w-7 shrink-0 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, var(--cd-accent), var(--cd-accent-2))",
                  boxShadow: "0 0 12px var(--accent-glow)",
                }}
              />
              <div className="flex flex-1 flex-col gap-1">
                <span className="block h-1.5 w-4/5 rounded" style={{ background: "oklch(0.50 0.005 80 / 0.7)" }} />
                <span className="block h-1.5 w-3/5 rounded" style={{ background: "oklch(0.50 0.005 80 / 0.7)" }} />
              </div>
              <span style={{ color: "oklch(0.55 0.005 80)", fontSize: 9 }}>maintenant</span>
            </div>
          ))}
        </div>
        <div
          className="mx-auto mt-2 h-1 w-24 rounded-full"
          style={{ background: "oklch(0.85 0.005 80)" }}
        />
      </div>
    </div>
  );
}

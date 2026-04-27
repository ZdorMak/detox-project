import { useTranslations } from "next-intl";
import { SectionLabel } from "./SectionLabel";

const KEYS = ["durable", "addiction", "collaboration", "innovation", "smartphone", "interdisciplinaire", "accessible"] as const;

/**
 * 7 pillars in a 4-column grid (with 1px line gutters), each cell with a
 * mono number + a small SVG arc that grows for higher index. Direct port
 * of `.pillars`.
 */
export function Pillars() {
  const t = useTranslations("landing.pillars");
  return (
    <section
      className="border-t"
      style={{ borderColor: "var(--line)", padding: "100px var(--pad-x)" }}
    >
      <div className="mb-14">
        <SectionLabel num="04" label={t("label")} />
        <h2
          className="font-display max-w-[22ch] text-balance leading-none"
          style={{
            fontSize: "clamp(36px, 5vw, 72px)",
            letterSpacing: "-0.03em",
          }}
        >
          {t.rich("titleRich", {
            em: (chunks) => <em>{chunks}</em>,
          })}
        </h2>
      </div>

      <div
        className="grid overflow-hidden rounded-[18px] border md:grid-cols-2 lg:grid-cols-4"
        style={{
          gap: "1px",
          background: "var(--line)",
          borderColor: "var(--line)",
        }}
      >
        {KEYS.map((key, i) => (
          <article
            key={key}
            className="flex min-h-[220px] flex-col p-7 transition-colors hover:bg-[var(--bg-2)]"
            style={{ background: "var(--bg)" }}
          >
            <header className="mb-7 flex items-start justify-between">
              <span className="cd-mono cd-dim">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span aria-hidden="true" style={{ color: "var(--cd-accent)" }}>
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="currentColor"
                    strokeOpacity="0.15"
                    strokeWidth="1"
                    fill="none"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray={`${(i + 1) * 12} 88`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
              </span>
            </header>
            <h3
              className="font-display mb-2"
              style={{
                fontSize: 24,
                letterSpacing: "-0.015em",
              }}
            >
              {t(`items.${key}.title`)}
            </h3>
            <p
              className="flex-1 text-[13px] leading-normal"
              style={{ color: "var(--fg-2)" }}
            >
              {t(`items.${key}.description`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

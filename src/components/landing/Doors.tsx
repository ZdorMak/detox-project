import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * "Three doors" — the landing's primary navigation block, ported from the
 * Claude Design export's `.doors` section. 3 cards in a 1px-gap grid; the
 * middle one is highlighted as `door-accent`.
 */
export function Doors() {
  const t = useTranslations("landing.doors");
  const doors = [
    {
      num: "01",
      titleKey: "story.title",
      descKey: "story.desc",
      ctaKey: "story.cta",
      tagKey: "story.tag",
      visual: "story" as const,
      href: "/experience",
    },
    {
      num: "02",
      titleKey: "profile.title",
      descKey: "profile.desc",
      ctaKey: "profile.cta",
      tagKey: "profile.tag",
      visual: "profile" as const,
      href: "/survey",
      accent: true,
    },
    {
      num: "03",
      titleKey: "cards.title",
      descKey: "cards.desc",
      ctaKey: "cards.cta",
      tagKey: "cards.tag",
      visual: "cards" as const,
      href: "/jeu",
    },
  ];

  return (
    <section
      className="border-t px-[var(--pad-x)] py-[100px]"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mb-14">
        <SectionLabel num="01" label={t("eyebrow")} />
        <h2
          className="font-display max-w-[22ch] text-balance leading-none"
          style={{
            fontSize: "clamp(36px, 5vw, 72px)",
            letterSpacing: "-0.03em",
          }}
        >
          {t("titlePart1")}{" "}
          <em>{t("titleAccent")}</em>
          <br />
          {t("titlePart2")}
        </h2>
      </div>

      <ul
        className="grid grid-cols-1 gap-px overflow-hidden border md:grid-cols-3"
        style={{
          background: "var(--line)",
          borderColor: "var(--line)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        {doors.map((d) => (
          <li key={d.num}>
            <Link
              href={d.href}
              className={`group relative flex h-full min-h-[460px] flex-col p-8 transition-colors`}
              style={{
                background: d.accent ? "var(--bg-2)" : "var(--bg)",
              }}
            >
              {d.accent && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 80% -10%, var(--accent-soft), transparent 60%)",
                  }}
                />
              )}
              <div className="relative mb-8 flex items-center justify-between">
                <span className="cd-mono cd-dim">{d.num}</span>
                <span
                  className="cd-mono rounded-full border px-2.5 py-1"
                  style={{
                    color: d.accent ? "var(--cd-accent)" : "var(--fg-3)",
                    background: "var(--bg-2)",
                    borderColor: d.accent ? "var(--cd-accent)" : "var(--line-2)",
                    fontSize: 10,
                  }}
                >
                  {t(d.tagKey)}
                </span>
              </div>

              <DoorVisual
                kind={d.visual}
                accent={Boolean(d.accent)}
              />

              <h3
                className="font-display mb-3 leading-tight"
                style={{
                  fontSize: 32,
                  letterSpacing: "-0.015em",
                }}
              >
                {t(d.titleKey)}
              </h3>
              <p
                className="max-w-[30ch] flex-1 text-[15px] leading-relaxed"
                style={{ color: "var(--fg-2)" }}
              >
                {t(d.descKey)}
              </p>

              <span
                className="cd-mono mt-7 inline-flex w-fit items-center gap-2 border-b py-3 transition-all group-hover:gap-3.5"
                style={{
                  borderBottomColor: "var(--line-2)",
                  color: "var(--fg)",
                }}
              >
                {t(d.ctaKey)}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="cd-mono mb-7 flex items-center gap-3.5" style={{ color: "var(--fg-3)" }}>
      <span className="cd-dim">{num}</span>
      <span className="h-px w-20" style={{ background: "var(--line-2)" }} />
      <span>{label}</span>
    </div>
  );
}

function DoorVisual({
  kind,
  accent,
}: {
  kind: "story" | "profile" | "cards";
  accent: boolean;
}) {
  const stroke = accent ? "var(--cd-accent)" : "currentColor";
  return (
    <div
      className="relative mb-7 h-20 overflow-hidden rounded-sm border"
      style={{
        borderColor: "var(--line)",
        background: "var(--bg)",
        color: accent ? "var(--cd-accent)" : "var(--fg-2)",
      }}
    >
      {kind === "story" && (
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d="M0,50 Q50,20 100,50 T200,50" stroke={stroke} strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M0,60 Q50,30 100,60 T200,60" stroke={stroke} strokeWidth="1" fill="none" opacity="0.25" />
          <circle cx="100" cy="50" r="3" fill={stroke} />
        </svg>
      )}
      {kind === "profile" && (
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {[...Array(10)].map((_, i) => (
            <rect
              key={i}
              x={i * 20 + 4}
              y={20 + (i % 3) * 12}
              width="12"
              height={70 - (i % 3) * 12}
              fill={stroke}
              opacity={0.15 + i / 30}
            />
          ))}
        </svg>
      )}
      {kind === "cards" && (
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <rect x="60" y="20" width="80" height="60" rx="6" fill="none" stroke={stroke} opacity="0.2" transform="rotate(-6 100 50)" />
          <rect x="60" y="20" width="80" height="60" rx="6" fill="none" stroke={stroke} opacity="0.4" transform="rotate(-2 100 50)" />
          <rect x="60" y="20" width="80" height="60" rx="6" fill="none" stroke={stroke} opacity="0.7" transform="rotate(2 100 50)" />
        </svg>
      )}
    </div>
  );
}

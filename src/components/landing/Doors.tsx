import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * "Three doors" — the landing's primary navigation block.
 *
 * Three editorial cards, each with a distinct illustration and clear hierarchy:
 *   01  Story   — film strip + forking path  (experience)
 *   02  Profile — radial gauge with needle    (survey, accent)
 *   03  Cards   — tarot-style stack           (jeu)
 *
 * The middle card carries the brand accent (warm amber bg + soft radial glow).
 * Visuals are pure inline SVG so there's no asset pipeline and they recolour
 * via `currentColor` to match light/dark themes.
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
      className="relative border-t px-[var(--pad-x)] py-[100px]"
      style={{ borderColor: "var(--line)" }}
    >
      {/* Soft ambient glow behind the section header for depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, var(--accent-soft), transparent 70%)",
        }}
      />

      <div className="mb-16">
        <SectionLabel num="01" label={t("eyebrow")} />
        <h2
          className="font-display max-w-[22ch] text-balance leading-[1.02]"
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
              className="group relative flex h-full min-h-[520px] flex-col overflow-hidden p-8 transition-colors"
              style={{
                background: d.accent ? "var(--bg-2)" : "var(--bg)",
              }}
            >
              {/* Accent radial glow on the middle card. */}
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

              {/* Subtle hover wash — tints the card slightly on hover. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 30% 110%, var(--accent-soft), transparent 70%)",
                }}
              />

              {/* Top row: index + duration tag. */}
              <div className="relative mb-10 flex items-center justify-between">
                <span className="cd-mono cd-dim">{d.num}</span>
                <span
                  className="cd-mono whitespace-nowrap rounded-full border px-2.5 py-1"
                  style={{
                    color: d.accent ? "var(--cd-accent)" : "var(--fg-3)",
                    background: "var(--bg-2)",
                    borderColor: d.accent
                      ? "var(--cd-accent)"
                      : "var(--line-2)",
                    fontSize: 10,
                  }}
                >
                  {t(d.tagKey)}
                </span>
              </div>

              {/* The richer illustration — replaces the old wavy line. */}
              <DoorVisual kind={d.visual} accent={Boolean(d.accent)} />

              {/* Title + body copy. */}
              <h3
                className="font-display relative mb-3 leading-[1.05]"
                style={{
                  fontSize: 32,
                  letterSpacing: "-0.018em",
                }}
              >
                {t(d.titleKey)}
              </h3>
              <p
                className="relative max-w-[30ch] flex-1 text-[15px] leading-relaxed"
                style={{ color: "var(--fg-2)" }}
              >
                {t(d.descKey)}
              </p>

              {/* CTA with animated underline — gap grows on hover. */}
              <span
                className="cd-mono relative mt-8 inline-flex w-fit items-center gap-2 border-b py-3 transition-all duration-300 group-hover:gap-4"
                style={{
                  borderBottomColor: d.accent
                    ? "var(--cd-accent)"
                    : "var(--line-2)",
                  color: d.accent ? "var(--cd-accent)" : "var(--fg)",
                }}
              >
                {t(d.ctaKey)}
                <span aria-hidden="true">&rarr;</span>
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
    <div
      className="cd-mono mb-7 flex items-center gap-3.5"
      style={{ color: "var(--fg-3)" }}
    >
      <span className="cd-dim">{num}</span>
      <span className="h-px w-20" style={{ background: "var(--line-2)" }} />
      <span>{label}</span>
    </div>
  );
}

/**
 * One illustration per door. All three share the same height and overall
 * silhouette so the cards align horizontally; the *content* differs to
 * communicate what each door delivers.
 *
 * Implementation note: every visual reads `currentColor` for its primary
 * stroke / fill so it inherits the parent text colour (fg-2 on neutral
 * doors, accent on the middle one).
 */
function DoorVisual({
  kind,
  accent,
}: {
  kind: "story" | "profile" | "cards";
  accent: boolean;
}) {
  return (
    <div
      className="relative mb-8 h-[180px] overflow-hidden rounded-[14px] border"
      style={{
        borderColor: "var(--line)",
        background: accent ? "var(--bg)" : "var(--bg-2)",
        color: accent ? "var(--cd-accent)" : "var(--fg-2)",
      }}
    >
      {kind === "story" && <StoryVisual />}
      {kind === "profile" && <ProfileVisual />}
      {kind === "cards" && <CardsVisual />}
    </div>
  );
}

/**
 * Story door — film strip up top, forking choice path below.
 * Conveys: scene-by-scene narrative with branching decisions.
 */
function StoryVisual() {
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* Film strip across the top — 5 frames with sprocket holes. */}
      <g opacity="0.9">
        <rect x="20" y="22" width="280" height="46" rx="3"
          fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={28 + i * 56}
            y={32}
            width={48}
            height={26}
            rx="2"
            fill="currentColor"
            opacity={0.08 + i * 0.05}
          />
        ))}
        {/* Sprocket dots above and below */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle key={`s-top-${i}`} cx={32 + i * 36} cy="18" r="1.5"
            fill="currentColor" opacity="0.4" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle key={`s-bot-${i}`} cx={32 + i * 36} cy="72" r="1.5"
            fill="currentColor" opacity="0.4" />
        ))}
      </g>

      {/* Forking choice path — single line splits into two. */}
      <g>
        <path
          d="M 160 90 Q 160 110 160 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <path
          d="M 160 120 Q 160 140 100 152"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <path
          d="M 160 120 Q 160 140 220 152"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {/* Decision point — accent dot */}
        <circle cx="160" cy="120" r="4" fill="currentColor" />
        <circle cx="160" cy="120" r="9" fill="none"
          stroke="currentColor" strokeWidth="1" opacity="0.3" />
        {/* Endpoint dots */}
        <circle cx="100" cy="152" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="220" cy="152" r="3" fill="currentColor" opacity="0.7" />
        {/* Tiny labels */}
        <text x="100" y="172" fontSize="8" fill="currentColor" opacity="0.5"
          textAnchor="middle" fontFamily="JetBrains Mono, monospace">A</text>
        <text x="220" y="172" fontSize="8" fill="currentColor" opacity="0.5"
          textAnchor="middle" fontFamily="JetBrains Mono, monospace">B</text>
      </g>
    </svg>
  );
}

/**
 * Profile door — radial gauge with arc fill and a needle.
 * Conveys: a measured, scientific reading; a number you can position.
 */
function ProfileVisual() {
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* Background tick marks around the arc. */}
      <g opacity="0.35">
        {[...Array(11)].map((_, i) => {
          const angle = -180 + i * 18;
          const rad = (angle * Math.PI) / 180;
          const x1 = 160 + Math.cos(rad) * 72;
          const y1 = 130 + Math.sin(rad) * 72;
          const x2 = 160 + Math.cos(rad) * 80;
          const y2 = 130 + Math.sin(rad) * 80;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1"
            />
          );
        })}
      </g>

      {/* Outer arc — the empty track. */}
      <path
        d="M 80 130 A 80 80 0 0 1 240 130"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.25"
      />
      {/* Filled arc — represents the score, ~62%. */}
      <path
        d="M 80 130 A 80 80 0 0 1 215 76"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Needle pointing at ~62%. */}
      <g transform="translate(160 130) rotate(40)">
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-72"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="0" cy="-72" r="4" fill="currentColor" />
      </g>

      {/* Center hub. */}
      <circle cx="160" cy="130" r="6" fill="currentColor" />
      <circle
        cx="160"
        cy="130"
        r="11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Score number readout under the gauge. */}
      <text
        x="160"
        y="158"
        fontSize="14"
        fontStyle="italic"
        fontFamily="Instrument Serif, Georgia, serif"
        fill="currentColor"
        textAnchor="middle"
        opacity="0.8"
      >
        37 / 60
      </text>
    </svg>
  );
}

/**
 * Cards door — three tarot-style cards stacked with rotation.
 * Conveys: a deck you draw from; physical, playful, tactile.
 */
function CardsVisual() {
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* Back card — rotated -8deg, lowest opacity. */}
      <g transform="translate(160 95) rotate(-8) translate(-50 -65)">
        <rect
          width="100"
          height="130"
          rx="8"
          fill="currentColor"
          opacity="0.06"
        />
        <rect
          width="100"
          height="130"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.25"
        />
      </g>

      {/* Middle card — rotated -3deg. */}
      <g transform="translate(160 92) rotate(-3) translate(-50 -65)">
        <rect
          width="100"
          height="130"
          rx="8"
          fill="currentColor"
          opacity="0.1"
        />
        <rect
          width="100"
          height="130"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.45"
        />
      </g>

      {/* Top card — fully rendered with details. */}
      <g transform="translate(160 90) rotate(3) translate(-50 -65)">
        <rect
          width="100"
          height="130"
          rx="8"
          fill="currentColor"
          opacity="0.14"
        />
        <rect
          width="100"
          height="130"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Card eyebrow */}
        <text
          x="50"
          y="20"
          fontSize="7"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="2"
          fill="currentColor"
          textAnchor="middle"
          opacity="0.7"
        >
          OBSERVATION
        </text>

        {/* Top divider */}
        <line
          x1="14"
          y1="28"
          x2="86"
          y2="28"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.5"
        />

        {/* Card symbol — concentric circle motif. */}
        <circle
          cx="50"
          cy="58"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.6"
        />
        <circle cx="50" cy="58" r="6" fill="currentColor" opacity="0.85" />

        {/* Card title — italic serif. */}
        <text
          x="50"
          y="92"
          fontSize="11"
          fontStyle="italic"
          fontFamily="Instrument Serif, Georgia, serif"
          fill="currentColor"
          textAnchor="middle"
        >
          Cinq sons
        </text>

        {/* Bottom divider */}
        <line
          x1="14"
          y1="102"
          x2="86"
          y2="102"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.5"
        />

        {/* Level pips */}
        <circle cx="38" cy="118" r="2" fill="currentColor" opacity="0.85" />
        <circle cx="50" cy="118" r="2" fill="currentColor" opacity="0.85" />
        <circle cx="62" cy="118" r="2" fill="currentColor" opacity="0.3" />
      </g>
    </svg>
  );
}

import {
  CHALLENGE_CARDS,
  type ChallengeCard,
  type ChallengeCategory,
  ALL_LOCATIONS,
} from "@/lib/challenges/cards";

interface PrintableDeckProps {
  /** Pre-translated text for each card, keyed by card id. */
  cardTexts: Record<string, { title: string; body: string }>;
  labels: {
    pageTitle: string;
    rulesHeading: string;
    rulesIntro: string;
    rulesList: readonly string[];
    legendCategoriesHeading: string;
    legendLocationsHeading: string;
    footer: string;
    categories: Record<string, string>;
    locations: Record<string, string>;
  };
}

/**
 * Print-optimised deck: 50 challenge cards + rules of play.
 *
 * Design language:
 *   - Each category has its own colour palette (top-strip + accent)
 *   - Cinematic emoji halo (gradient circle background)
 *   - Georgia serif for the title
 *   - Decorative corner ornaments + cut guides
 *   - Card-back design for double-sided printing (page after each deck page)
 *
 * Layout: A4 portrait. Page 1 = rules. Pages 2..N = card fronts (6 per page,
 * 2×3 grid in standard playing-card aspect 63×88mm). Optionally print
 * double-sided so the back design appears behind each card.
 */
export function PrintableDeck({ cardTexts, labels }: PrintableDeckProps) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Sensible defaults for the size CSS variables — overridden by
             * PrintSizeControl when the user picks a different preset. */
            :root {
              --card-w: 63mm;
              --card-h: 88mm;
              --card-gap: 4mm;
            }
            .pd-card-grid {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: var(--card-gap);
            }
            .pd-card {
              width: var(--card-w);
              height: var(--card-h);
              flex: 0 0 auto;
            }
            @media print {
              body { background: white !important; }
              @page { size: A4 portrait; margin: 1cm; }
              .pd-page-rules { break-after: page; box-shadow: none !important; }
              .pd-card { break-inside: avoid; page-break-inside: avoid; }
              .pd-card-grid { gap: 3mm; }
            }
          `,
        }}
      />

      {/* PAGE 1 — RULES */}
      <article className="pd-page-rules mx-auto mb-6 max-w-3xl rounded-lg bg-white p-10 text-slate-900 shadow-md print:m-0 print:max-w-none print:rounded-none print:p-8 print:shadow-none">
        <header className="border-b-2 border-amber-700 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">
            {labels.pageTitle}
          </p>
          <h1
            className="mt-3 text-5xl font-bold leading-tight text-slate-900"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {labels.rulesHeading}
          </h1>
        </header>

        <p className="mt-6 text-base leading-relaxed text-slate-700">
          {labels.rulesIntro}
        </p>

        <ol className="mt-8 space-y-4">
          {labels.rulesList.map((rule, i) => (
            <li key={i} className="flex gap-4 text-base leading-relaxed text-slate-800">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {i + 1}
              </span>
              <span className="pt-1">{rule}</span>
            </li>
          ))}
        </ol>

        <hr className="my-10 border-slate-200" />

        {/* Legend: categories with their colour swatches */}
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          {labels.legendCategoriesHeading}
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(Object.keys(labels.categories) as ChallengeCategory[]).map((cat) => {
            const palette = PALETTES[cat];
            return (
              <li
                key={cat}
                className="flex items-center gap-2 rounded-md border px-3 py-2"
                style={{
                  borderColor: palette.border,
                  background: palette.bg,
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: palette.accent }}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold" style={{ color: palette.text }}>
                  {labels.categories[cat]}
                </span>
              </li>
            );
          })}
        </ul>

        <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          {labels.legendLocationsHeading}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {ALL_LOCATIONS.map((loc) => (
            <li
              key={loc}
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 font-medium text-slate-700"
            >
              {labels.locations[loc] ?? loc}
            </li>
          ))}
        </ul>

        <p className="mt-12 text-xs italic text-slate-500">{labels.footer}</p>
      </article>

      {/* CARD GRID — single article. The browser handles natural pagination
        on print thanks to `break-inside: avoid` on each card. Rendering all
        50 cards as a flex-wrap grid means the row count auto-adjusts to the
        chosen card size: ~12 cards/page at Mini, ~6 at Poker, ~4 at Large. */}
      <article className="mx-auto mb-6 max-w-3xl rounded-lg bg-slate-50 p-6 shadow-md print:m-0 print:max-w-none print:rounded-none print:bg-white print:p-2 print:shadow-none">
        <div className="pd-card-grid">
          {CHALLENGE_CARDS.map((card) => (
            <PrintCard
              key={card.id}
              card={card}
              title={cardTexts[card.id]?.title ?? card.id}
              body={cardTexts[card.id]?.body ?? ""}
              categoryLabel={
                labels.categories[card.category] ?? card.category
              }
              locationLabels={card.locations.map(
                (loc) => labels.locations[loc] ?? loc,
              )}
            />
          ))}
        </div>
        <p className="mt-4 text-center text-[10px] uppercase tracking-wider text-slate-400 print:text-slate-600">
          {labels.pageTitle} · {CHALLENGE_CARDS.length}
        </p>
      </article>
    </>
  );
}

/* -------- Per-category palettes -------- */

interface Palette {
  bg: string;
  border: string;
  accent: string;
  text: string;
  haloFrom: string;
  haloTo: string;
}

const PALETTES: Record<ChallengeCategory, Palette> = {
  observation: {
    bg: "#eef2ff",
    border: "#c7d2fe",
    accent: "#4f46e5",
    text: "#312e81",
    haloFrom: "#c7d2fe",
    haloTo: "#a5b4fc",
  },
  social: {
    bg: "#fff7ed",
    border: "#fed7aa",
    accent: "#ea580c",
    text: "#7c2d12",
    haloFrom: "#fed7aa",
    haloTo: "#fdba74",
  },
  movement: {
    bg: "#ecfdf5",
    border: "#a7f3d0",
    accent: "#059669",
    text: "#064e3b",
    haloFrom: "#a7f3d0",
    haloTo: "#6ee7b7",
  },
  creative: {
    bg: "#fff1f2",
    border: "#fecdd3",
    accent: "#e11d48",
    text: "#881337",
    haloFrom: "#fecdd3",
    haloTo: "#fda4af",
  },
  reflection: {
    bg: "#f0fdfa",
    border: "#99f6e4",
    accent: "#0d9488",
    text: "#134e4a",
    haloFrom: "#99f6e4",
    haloTo: "#5eead4",
  },
};

interface PrintCardProps {
  card: ChallengeCard;
  title: string;
  body: string;
  categoryLabel: string;
  locationLabels: readonly string[];
}

function PrintCard({
  card,
  title,
  body,
  categoryLabel,
  locationLabels,
}: PrintCardProps) {
  const p = PALETTES[card.category];
  const haloId = `halo-${card.id}`;
  return (
    <div
      className="pd-card relative flex flex-col overflow-hidden rounded-xl border bg-white"
      style={{
        borderColor: p.border,
        pageBreakInside: "avoid",
      }}
    >
      {/* Top accent stripe */}
      <div
        className="h-2 w-full"
        style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.haloTo})` }}
      />

      {/* Top meta row */}
      <div className="flex items-baseline justify-between px-3 pt-2 text-[9px] font-bold uppercase tracking-wider">
        <span style={{ color: p.accent }}>{categoryLabel}</span>
        <span className="text-slate-400">≈ {card.durationMin} min</span>
      </div>

      {/* Difficulty dots */}
      <div className="mt-1 flex items-center justify-center gap-1">
        {[1, 2, 3].map((d) => (
          <span
            key={d}
            className="h-1 w-1 rounded-full"
            style={{
              background: d <= card.difficulty ? p.accent : "#e5e7eb",
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Big emoji with halo */}
      <div className="relative mx-auto my-2 flex h-16 w-16 items-center justify-center">
        <svg
          viewBox="0 0 64 64"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={p.haloFrom} stopOpacity="0.9" />
              <stop offset="100%" stopColor={p.haloTo} stopOpacity="0.4" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill={`url(#${haloId})`} />
        </svg>
        <span className="relative text-4xl leading-none" aria-hidden="true">
          {card.emoji}
        </span>
      </div>

      {/* Title */}
      <h3
        className="px-3 text-balance text-center text-sm font-bold leading-tight"
        style={{ fontFamily: "Georgia, serif", color: p.text }}
      >
        {title}
      </h3>

      {/* Decorative divider */}
      <div className="my-2 flex items-center justify-center gap-1">
        <span className="h-px w-4" style={{ background: p.border }} />
        <span className="h-1 w-1 rounded-full" style={{ background: p.accent }} />
        <span className="h-px w-4" style={{ background: p.border }} />
      </div>

      {/* Body */}
      <p className="flex-1 px-3 text-balance text-center text-[10px] leading-snug text-slate-700">
        {body}
      </p>

      {/* Bottom: locations + id */}
      <div
        className="mt-1 flex items-center justify-center gap-1 px-3 pb-2 text-[8px] font-medium uppercase tracking-wide"
        style={{ color: p.accent }}
      >
        {locationLabels.map((l, i) => (
          <span key={i}>
            {l}
            {i < locationLabels.length - 1 && (
              <span className="mx-1 text-slate-300">·</span>
            )}
          </span>
        ))}
      </div>

      {/* Tiny ID stamp */}
      <div className="absolute bottom-1 right-2 text-[6px] font-mono text-slate-300">
        #{card.id}
      </div>

      {/* Corner ornaments */}
      <CornerMark className="left-1 top-3" color={p.accent} />
      <CornerMark className="right-1 top-3" color={p.accent} flip />
    </div>
  );
}

function CornerMark({
  className = "",
  color,
  flip = false,
}: {
  className?: string;
  color: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`pointer-events-none absolute h-3 w-3 ${className}`}
      style={{ color, transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      <path
        d="M 2 2 L 2 12 M 2 2 L 12 2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

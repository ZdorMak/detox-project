import type { CSSProperties } from "react";
import {
  CHALLENGE_CARDS,
  type ChallengeCard,
  type ChallengeCategory,
  type Location,
  ALL_LOCATIONS,
} from "@/lib/challenges/cards";

/** Compact emoji map for locations — keeps the print card footer tidy. */
const LOCATION_ICONS: Record<Location, string> = {
  home: "🏠",
  school: "🏫",
  transport: "🚆",
  outside: "🌳",
  with_friends: "👥",
};

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
 *   - Italic Instrument Serif for the title (matches the on-screen brand)
 *   - Decorative corner brackets + dot-rule divider
 *   - Location row reduced to emoji icons (or one globe for "anywhere")
 *
 * Sizing: physical width / height set via CSS variables `--card-w` and
 * `--card-h` (mm units). The card itself is a CSS container, and every
 * inner text element uses `cqi` (container-query inline-size) units so
 * the typography scales smoothly across all five size presets.
 *
 * Layout: A4 portrait. Page 1 = rules. Cards flow in a flex-wrap grid;
 * the browser handles natural page breaks (each card is `break-inside: avoid`).
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
              /* Container queries: child text sizes scale with card width via cqi units. */
              container-type: inline-size;
              font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            }
            /* Proportional type system — every text element scales with card width. */
            .pd-card .pd-eyebrow { font-size: 2.4cqi; letter-spacing: 0.18em; font-weight: 700; }
            .pd-card .pd-meta    { font-size: 2.4cqi; letter-spacing: 0.12em; font-weight: 600; }
            .pd-card .pd-title   {
              font-size: 7cqi; line-height: 1.04;
              font-family: var(--font-display, "Instrument Serif", Georgia, serif);
              font-style: italic; font-weight: 400; letter-spacing: -0.01em;
            }
            .pd-card .pd-body    { font-size: 3.4cqi; line-height: 1.45; }
            .pd-card .pd-loc     { font-size: 5cqi; }
            .pd-card .pd-stamp   { font-size: 1.8cqi; letter-spacing: 0.12em; font-weight: 500; }
            .pd-card .pd-id      { font-size: 1.6cqi; }
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
}

function PrintCard({ card, title, body, categoryLabel }: PrintCardProps) {
  const p = PALETTES[card.category];
  const haloId = `halo-${card.id}`;

  // If a card lives in 4 of 5 locations or more, treat it as universal —
  // a single globe icon reads cleaner than five tiny emoji cluttering up
  // the bottom row.
  const universalLocations = card.locations.length >= 4;

  return (
    <div
      className="pd-card relative flex flex-col overflow-hidden rounded-xl border bg-white"
      style={{
        borderColor: p.border,
        pageBreakInside: "avoid",
      }}
    >
      {/* Top accent stripe — slim, gradient. */}
      <div
        style={{
          height: "1.6cqi",
          background: `linear-gradient(90deg, ${p.accent}, ${p.haloTo})`,
        }}
      />

      {/* Top meta row: category eyebrow + duration. */}
      <div
        className="flex items-baseline justify-between"
        style={{ padding: "3cqi 5cqi 0" }}
      >
        <span
          className="pd-eyebrow uppercase"
          style={{ color: p.accent }}
        >
          {categoryLabel}
        </span>
        <span className="pd-meta uppercase" style={{ color: "#94a3b8" }}>
          &asymp; {card.durationMin} min
        </span>
      </div>

      {/* Difficulty pips — three concentric dots; unfilled = locked. */}
      <div
        className="flex items-center justify-center"
        style={{ gap: "1cqi", marginTop: "2cqi" }}
      >
        {[1, 2, 3].map((d) => (
          <span
            key={d}
            aria-hidden="true"
            style={{
              width: "1.4cqi",
              height: "1.4cqi",
              borderRadius: "50%",
              background: d <= card.difficulty ? p.accent : "#e2e8f0",
            }}
          />
        ))}
      </div>

      {/* Big emoji with radial halo — symbol of the action. */}
      <div
        className="relative mx-auto"
        style={{
          width: "26cqi",
          height: "26cqi",
          marginTop: "2.5cqi",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
              <stop
                offset="0%"
                stopColor={p.haloFrom}
                stopOpacity="0.9"
              />
              <stop
                offset="100%"
                stopColor={p.haloTo}
                stopOpacity="0.4"
              />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill={`url(#${haloId})`} />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center leading-none"
          aria-hidden="true"
          style={{ fontSize: "14cqi" }}
        >
          {card.emoji}
        </span>
      </div>

      {/* Title — italic Instrument Serif, the editorial centre of the card. */}
      <h3
        className="pd-title text-balance text-center"
        style={{
          padding: "3.5cqi 5cqi 0",
          color: p.text,
        }}
      >
        {title}
      </h3>

      {/* Hairline divider with a centre dot. */}
      <div
        className="flex items-center justify-center"
        style={{ gap: "1.4cqi", margin: "2.6cqi 0 1.6cqi" }}
        aria-hidden="true"
      >
        <span
          style={{
            height: "0.25cqi",
            width: "5cqi",
            background: p.border,
          }}
        />
        <span
          style={{
            width: "1.1cqi",
            height: "1.1cqi",
            borderRadius: "50%",
            background: p.accent,
          }}
        />
        <span
          style={{
            height: "0.25cqi",
            width: "5cqi",
            background: p.border,
          }}
        />
      </div>

      {/* Body — instruction text, centred, balanced. */}
      <p
        className="pd-body flex-1 text-balance text-center"
        style={{
          padding: "0 5cqi",
          color: "#475569",
        }}
      >
        {body}
      </p>

      {/* Bottom row — locations on the left, brand stamp on the right. */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "2cqi 4cqi 2cqi",
          marginTop: "1.5cqi",
          borderTop: `1px dashed ${p.border}`,
        }}
      >
        <div
          className="pd-loc flex items-center"
          style={{ gap: "1cqi", lineHeight: 1 }}
          aria-hidden="true"
        >
          {universalLocations ? (
            <span title="anywhere">🌐</span>
          ) : (
            card.locations.map((loc) => (
              <span key={loc}>{LOCATION_ICONS[loc]}</span>
            ))
          )}
        </div>
        <span
          className="pd-stamp uppercase"
          style={{ color: p.accent, opacity: 0.7 }}
        >
          Detox
        </span>
      </div>

      {/* ID stamp — barely visible, for sorting / reprint reference. */}
      <div
        className="pd-id absolute"
        style={{
          bottom: "0.6cqi",
          right: "5cqi",
          color: "#cbd5e1",
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
        }}
      >
        #{card.id}
      </div>

      {/* Corner ornaments — top-left + top-right brackets. */}
      <CornerMark style={{ left: "1.5cqi", top: "3cqi" }} color={p.accent} />
      <CornerMark
        style={{ right: "1.5cqi", top: "3cqi" }}
        color={p.accent}
        flip
      />
    </div>
  );
}

function CornerMark({
  style,
  color,
  flip = false,
}: {
  style?: CSSProperties;
  color: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="pointer-events-none absolute"
      style={{
        ...style,
        width: "4cqi",
        height: "4cqi",
        color,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
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

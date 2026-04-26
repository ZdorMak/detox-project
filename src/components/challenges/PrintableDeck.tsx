import { CHALLENGE_CARDS, type ChallengeCard, ALL_LOCATIONS } from "@/lib/challenges/cards";

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
 * Print-optimised view of the entire 35-card deck plus the rules of play.
 *
 * Layout: A4 portrait. Page 1 = rules + legend. Pages 2-7 = cards in a
 * 2×3 grid (6 per page → 6 pages × 6 = 36 slots, last page has 5 cards
 * + 1 padding cell).
 *
 * Print-only CSS in the <style> block below: removes shadows, forces
 * page breaks between sheets, dotted cut guides between cards.
 */
export function PrintableDeck({ cardTexts, labels }: PrintableDeckProps) {
  const PER_PAGE = 6;
  const pages: ChallengeCard[][] = [];
  for (let i = 0; i < CHALLENGE_CARDS.length; i += PER_PAGE) {
    pages.push([...CHALLENGE_CARDS.slice(i, i + PER_PAGE)]);
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; }
              @page { size: A4 portrait; margin: 1.2cm; }
              .pd-page { break-after: page; box-shadow: none !important; }
              .pd-page:last-of-type { break-after: auto; }
            }
          `,
        }}
      />

      {/* Page 1: rules */}
      <article className="pd-page mx-auto mb-6 max-w-3xl rounded-lg bg-white p-10 text-slate-900 shadow-md print:m-0 print:max-w-none print:rounded-none print:p-8 print:shadow-none">
        <header className="border-b-2 border-slate-900 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
            {labels.pageTitle}
          </p>
          <h1
            className="mt-2 text-4xl font-bold leading-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {labels.rulesHeading}
          </h1>
        </header>

        <p className="mt-6 text-base leading-relaxed">{labels.rulesIntro}</p>

        <ol className="mt-6 space-y-3 text-base leading-relaxed">
          {labels.rulesList.map((rule, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="text-2xl font-bold text-amber-700"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {i + 1}.
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>

        <hr className="my-8 border-slate-300" />

        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          {labels.legendCategoriesHeading}
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-5">
          {Object.entries(labels.categories).map(([key, name]) => (
            <li key={key}>
              <span className="font-semibold">{name}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-widest text-slate-500">
          {labels.legendLocationsHeading}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {ALL_LOCATIONS.map((loc) => (
            <li key={loc}>
              <span className="font-semibold">{labels.locations[loc] ?? loc}</span>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-xs text-slate-500">{labels.footer}</p>
      </article>

      {/* Card pages */}
      {pages.map((cards, pageIdx) => (
        <article
          key={pageIdx}
          className="pd-page mx-auto mb-6 max-w-3xl rounded-lg bg-white p-6 text-slate-900 shadow-md print:m-0 print:max-w-none print:rounded-none print:p-4 print:shadow-none"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cards.map((card) => (
              <PrintCard
                key={card.id}
                card={card}
                title={cardTexts[card.id]?.title ?? card.id}
                body={cardTexts[card.id]?.body ?? ""}
                categoryLabel={labels.categories[card.category] ?? card.category}
                locationLabels={card.locations.map((loc) => labels.locations[loc] ?? loc)}
              />
            ))}
            {/* Pad to keep grid balanced. */}
            {cards.length < PER_PAGE &&
              Array.from({ length: PER_PAGE - cards.length }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-[63/88]" />
              ))}
          </div>
          <p className="mt-3 text-center text-[10px] text-slate-400">
            {labels.pageTitle} · {pageIdx + 2} / {pages.length + 1}
          </p>
        </article>
      ))}
    </>
  );
}

interface PrintCardProps {
  card: ChallengeCard;
  title: string;
  body: string;
  categoryLabel: string;
  locationLabels: readonly string[];
}

function PrintCard({ card, title, body, categoryLabel, locationLabels }: PrintCardProps) {
  return (
    <div
      className="relative flex aspect-[63/88] flex-col rounded-lg border-2 border-dashed border-slate-300 bg-white p-3 text-slate-900"
      style={{ pageBreakInside: "avoid" }}
    >
      <div className="flex items-baseline justify-between text-[9px] font-semibold uppercase tracking-wider text-slate-500">
        <span>{categoryLabel}</span>
        <span>≈ {card.durationMin} min</span>
      </div>

      <div className="my-2 text-center text-4xl leading-none" aria-hidden="true">
        {card.emoji}
      </div>

      <h3 className="text-balance text-center text-sm font-bold leading-tight">
        {title}
      </h3>

      <p className="mt-1 flex-1 text-balance text-center text-[11px] leading-snug text-slate-700">
        {body}
      </p>

      <div className="mt-auto pt-1 text-center text-[8px] leading-tight text-slate-500">
        {locationLabels.join(" · ")}
      </div>

      <div className="absolute bottom-1 right-2 text-[7px] font-mono text-slate-300">
        #{card.id}
      </div>
    </div>
  );
}

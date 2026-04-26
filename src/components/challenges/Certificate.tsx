interface CertificateProps {
  playerName: string;
  level: { label: string; subtitle: string };
  totalCompleted: number;
  memberSinceISO: string | null;
  achievements: Array<{ id: string; emoji: string; title: string }>;
  completedPrograms: Array<{ id: string; emoji: string; title: string }>;
  labels: {
    headline: string;
    subhead: string;
    quote: string;
    memberSince: string;
    achievementsTitle: string;
    programsTitle: string;
    noProgramsYet: string;
    footer: string;
    unnamed: string;
  };
  locale: string;
}

/**
 * Printable certificate. Designed at A4 portrait — looks identical on screen
 * and via the browser's "Print → Save as PDF". Uses pure HTML + Tailwind so
 * no PDF library is required.
 *
 * Print-friendly tweaks via @media print rules in the inline <style> block.
 */
export function Certificate({
  playerName,
  level,
  totalCompleted,
  memberSinceISO,
  achievements,
  completedPrograms,
  labels,
  locale,
}: CertificateProps) {
  const memberSinceFormatted = memberSinceISO
    ? new Date(memberSinceISO).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const todayFormatted = new Date().toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; }
              @page { size: A4 portrait; margin: 1cm; }
            }
          `,
        }}
      />
      <div className="mx-auto max-w-4xl p-4 sm:p-8">
        <article
          className="relative mx-auto overflow-hidden rounded-3xl bg-white p-8 shadow-2xl print:shadow-none sm:p-12"
          style={{
            backgroundImage:
              "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.06) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)",
          }}
        >
          {/* Decorative corner ornaments */}
          <CornerOrnament className="left-4 top-4" rotate={0} />
          <CornerOrnament className="right-4 top-4" rotate={90} />
          <CornerOrnament className="bottom-4 left-4" rotate={-90} />
          <CornerOrnament className="bottom-4 right-4" rotate={180} />

          {/* Header */}
          <header className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              {labels.headline}
            </p>
            <p className="mt-1 text-sm uppercase tracking-widest text-slate-500">
              {labels.subhead}
            </p>
          </header>

          {/* Player name — the centerpiece */}
          <div className="mt-10 text-center">
            <p
              className="font-serif text-5xl font-bold leading-tight text-slate-900 sm:text-6xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {playerName || labels.unnamed}
            </p>
            <p className="mt-2 text-sm uppercase tracking-widest text-amber-600">
              · {level.label} ·
            </p>
            <p className="mt-1 text-sm italic text-slate-600">{level.subtitle}</p>
          </div>

          {/* Big number */}
          <div className="mt-10 flex items-baseline justify-center gap-3">
            <p
              className="text-7xl font-black leading-none text-emerald-600 tabular-nums sm:text-8xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {totalCompleted}
            </p>
            <p className="text-sm uppercase tracking-widest text-slate-500">
              cards
            </p>
          </div>

          {/* Quote */}
          <p className="mx-auto mt-6 max-w-xl text-balance text-center text-base italic leading-relaxed text-slate-700">
            « {labels.quote} »
          </p>

          {/* Achievements */}
          {achievements.length > 0 && (
            <section className="mt-10">
              <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
                {labels.achievementsTitle}
              </h2>
              <ul className="mt-4 flex flex-wrap items-start justify-center gap-3">
                {achievements.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-col items-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center"
                  >
                    <span className="text-2xl" aria-hidden="true">{a.emoji}</span>
                    <span className="mt-1 text-xs font-semibold text-amber-900">
                      {a.title}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Programs */}
          <section className="mt-8">
            <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
              {labels.programsTitle}
            </h2>
            {completedPrograms.length > 0 ? (
              <ul className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {completedPrograms.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-900"
                  >
                    <span aria-hidden="true">{p.emoji}</span>
                    <span>{p.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-center text-xs italic text-slate-500">
                {labels.noProgramsYet}
              </p>
            )}
          </section>

          {/* Footer */}
          <footer className="mt-12 flex flex-wrap items-end justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500">
            <div>
              {memberSinceFormatted && (
                <p>
                  {labels.memberSince} <span className="font-medium text-slate-700">{memberSinceFormatted}</span>
                </p>
              )}
              <p className="mt-1">
                <span className="font-medium text-slate-700">{todayFormatted}</span>
              </p>
            </div>
            <p className="text-right text-xs italic">{labels.footer}</p>
          </footer>
        </article>
      </div>
    </>
  );
}

function CornerOrnament({ className = "", rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={`pointer-events-none absolute h-12 w-12 text-amber-400 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <path d="M 4 4 L 4 26 M 4 4 L 26 4" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="4" cy="4" r="3" fill="currentColor" />
    </svg>
  );
}

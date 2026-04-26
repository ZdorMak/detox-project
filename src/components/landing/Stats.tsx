import { useTranslations } from "next-intl";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Live community-level numbers — gives credibility without revealing
 * anyone's individual data. Reads aggregates from Supabase server-side.
 *
 * If the queries fail, we render placeholder zeros instead of crashing —
 * the marketing impact of stats is "nice to have", not load-bearing.
 */
export async function Stats() {
  const t = await getStatsTranslator();

  let totalSessions = 0;
  let totalCardsDone = 0;
  let totalSurveysCompleted = 0;
  try {
    const supabase = createAdminClient();
    const [{ count: sessionsCount }, { count: cardsCount }, { count: completedCount }] =
      await Promise.all([
        supabase.from("sessions").select("id", { count: "exact", head: true }),
        supabase
          .from("challenge_attempts")
          .select("id", { count: "exact", head: true })
          .eq("outcome", "completed"),
        supabase
          .from("sessions")
          .select("id", { count: "exact", head: true })
          .not("completed_at", "is", null),
      ]);
    totalSessions = sessionsCount ?? 0;
    totalCardsDone = cardsCount ?? 0;
    totalSurveysCompleted = completedCount ?? 0;
  } catch (err) {
    console.warn("[landing/stats] read failed:", err);
  }

  const stats = [
    { key: "sessions", value: totalSessions, accent: "text-indigo-600 dark:text-indigo-400" },
    { key: "challenges", value: totalCardsDone, accent: "text-emerald-600 dark:text-emerald-400" },
    { key: "surveys", value: totalSurveysCompleted, accent: "text-rose-600 dark:text-rose-400" },
  ];

  return (
    <section
      aria-labelledby="stats-heading"
      className="relative isolate bg-gradient-to-b from-background to-muted/30 py-16 sm:py-20"
    >
      <div className="container mx-auto max-w-5xl px-4">
        <h2 id="stats-heading" className="sr-only">
          {t("title")}
        </h2>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((s) => (
            <li
              key={s.key}
              className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
            >
              <p
                className={`font-display text-5xl font-bold tabular-nums leading-none ${s.accent}`}
              >
                {s.value.toLocaleString("fr-CH")}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(`items.${s.key}` as const)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function getStatsTranslator() {
  const { getTranslations } = await import("next-intl/server");
  return getTranslations("landing.stats");
}

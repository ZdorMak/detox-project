import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLevel } from "@/lib/challenges/levels";
import { ACHIEVEMENTS } from "@/lib/challenges/achievements";
import { PROGRAMS } from "@/lib/challenges/programs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "challenges.profile" });
  return { title: t("metadata.title") };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "challenges" });

  const session = await getOrCreateSession();
  const supabase = createAdminClient();

  const [attemptsRes, achievementsRes, programsRes] = await Promise.all([
    supabase
      .from("challenge_attempts")
      .select("outcome")
      .eq("session_id", session.id),
    supabase
      .from("achievements_unlocked")
      .select("achievement_id, unlocked_at")
      .eq("session_id", session.id),
    supabase
      .from("program_progress")
      .select("program_id, step_index")
      .eq("session_id", session.id),
  ]);

  const attempts = attemptsRes.data ?? [];
  const totalCompleted = attempts.filter((a) => a.outcome === "completed").length;
  const totalSkipped = attempts.filter((a) => a.outcome === "skipped").length;
  const level = getLevel(totalCompleted);

  const unlockedSet = new Set((achievementsRes.data ?? []).map((r) => r.achievement_id));
  const programStepMax = new Map<string, number>();
  for (const row of programsRes.data ?? []) {
    const cur = programStepMax.get(row.program_id) ?? -1;
    if (row.step_index > cur) programStepMax.set(row.program_id, row.step_index);
  }

  const localePrefix = locale === "fr" ? "" : `/${locale}`;

  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("profile.title")}
        </h1>
      </header>

      {/* Level card */}
      <section className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("profile.levelLabel")}
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              {t(`levels.${level.current.id}.label` as const)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`levels.${level.current.id}.subtitle` as const)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {totalCompleted}
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("progress.completed")}
            </p>
          </div>
        </div>

        {level.next && (
          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between text-xs text-muted-foreground">
              <span>
                {t("profile.toNext", {
                  n: level.toNext ?? 0,
                  next: t(`levels.${level.next.id}.label` as const),
                })}
              </span>
              <span>{level.pct}%</span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={level.pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${level.pct}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Achievements grid */}
      <section className="mt-8" aria-labelledby="achievements-heading">
        <h2 id="achievements-heading" className="mb-3 text-xl font-bold">
          {t("profile.achievementsTitle", {
            unlocked: unlockedSet.size,
            total: ACHIEVEMENTS.length,
          })}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[...ACHIEVEMENTS]
            .sort(
              (a, b) =>
                Number(unlockedSet.has(b.id)) - Number(unlockedSet.has(a.id)) ||
                a.sortKey - b.sortKey,
            )
            .map((ach) => {
              const unlocked = unlockedSet.has(ach.id);
              return (
                <li
                  key={ach.id}
                  className={cn(
                    "flex flex-col items-center rounded-xl border p-4 text-center transition-colors",
                    unlocked
                      ? "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/40"
                      : "border-border bg-card opacity-50",
                  )}
                >
                  <span
                    className="text-3xl"
                    aria-hidden="true"
                    style={unlocked ? undefined : { filter: "grayscale(1)" }}
                  >
                    {ach.emoji}
                  </span>
                  <p className="mt-2 text-sm font-semibold leading-tight">
                    {t(`achievements.items.${ach.id}.title` as const)}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {t(`achievements.items.${ach.id}.description` as const)}
                  </p>
                </li>
              );
            })}
        </ul>
      </section>

      {/* Programs */}
      <section className="mt-8" aria-labelledby="programs-heading">
        <h2 id="programs-heading" className="mb-3 text-xl font-bold">
          {t("profile.programsTitle")}
        </h2>
        <ul className="space-y-3">
          {PROGRAMS.map((p) => {
            const lastIdx = programStepMax.get(p.id);
            const stepsDone = lastIdx == null ? 0 : lastIdx + 1;
            const total = p.cardIds.length;
            const pct = Math.round((stepsDone / total) * 100);
            const done = stepsDone >= total;
            return (
              <li key={p.id}>
                <Link
                  href={`${localePrefix}/jeu/programmes/${p.id}`}
                  className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-semibold">
                      <span className="mr-2" aria-hidden="true">{p.emoji}</span>
                      {t(`programs.items.${p.id}.title` as const)}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {stepsDone} / {total}
                      {done && <span className="ml-1 text-emerald-600">✓</span>}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(`programs.items.${p.id}.description` as const)}
                  </p>
                  <div
                    className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={cn(
                        "h-full transition-all",
                        done ? "bg-emerald-500" : "bg-primary",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Footer actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href={`${localePrefix}/jeu`}>{t("profile.backToCards")}</Link>
        </Button>
        <Button asChild>
          <Link href={`${localePrefix}/jeu/certificat`}>
            🏅 {t("profile.viewCertificate")}
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={`${localePrefix}/`}>{t("profile.home")}</Link>
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t("profile.skippedCount", { n: totalSkipped })}
      </p>
    </main>
  );
}

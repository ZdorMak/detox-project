import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getReadableSessionIds } from "@/lib/user-sessions";
import { PROGRAMS } from "@/lib/challenges/programs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileGameNav } from "@/components/challenges/MobileGameNav";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "challenges.programs" });
  return { title: t("metadata.title") };
}

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "challenges" });

  const session = await getOrCreateSession();
  const supabase = createAdminClient();
  const sessionIds = await getReadableSessionIds(session.id);

  const { data: progressRows } = await supabase
    .from("program_progress")
    .select("program_id, step_index")
    .in("session_id", sessionIds);

  const programStepMax = new Map<string, number>();
  for (const row of progressRows ?? []) {
    const cur = programStepMax.get(row.program_id) ?? -1;
    if (row.step_index > cur) programStepMax.set(row.program_id, row.step_index);
  }

  const localePrefix = locale === "fr" ? "" : `/${locale}`;

  return (
    <>
      <SiteHeader locale={locale} next={`${localePrefix}/jeu/programmes`} />
      <main id="main" className="mx-auto max-w-2xl px-4 py-8 pb-24 md:pb-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("programs.title")}
        </h1>
        <p className="mt-2 text-balance text-sm text-muted-foreground">
          {t("programs.subtitle")}
        </p>
      </header>

      <ul className="space-y-4">
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
                className="block rounded-2xl border-2 border-border bg-card p-5 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-bold">
                    <span className="mr-2 text-2xl" aria-hidden="true">{p.emoji}</span>
                    {t(`programs.items.${p.id}.title` as const)}
                  </h2>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {stepsDone} / {total}
                    {done && <span className="ml-1 text-emerald-600">✓</span>}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`programs.items.${p.id}.description` as const)}
                </p>
                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary"
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

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href={`${localePrefix}/jeu`}>{t("profile.backToCards")}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={`${localePrefix}/jeu/profil`}>{t("profile.viewProfile")}</Link>
        </Button>
      </div>
      </main>
      <MobileGameNav locale={locale} active="programs" />
    </>
  );
}

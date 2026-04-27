import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getReadableSessionIds } from "@/lib/user-sessions";
import { getLevel } from "@/lib/challenges/levels";
import { ACHIEVEMENTS } from "@/lib/challenges/achievements";
import { PROGRAMS } from "@/lib/challenges/programs";
import { Certificate } from "@/components/challenges/Certificate";
import { PrintButton } from "@/components/challenges/PrintButton";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "challenges.certificate" });
  return { title: t("metadata.title") };
}

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { locale } = await params;
  const { name } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "challenges" });

  const session = await getOrCreateSession();
  const supabase = createAdminClient();

  // Fetch the signed-in user (if any) so we can default the certificate
  // name to their Google profile. Falls back to the manual ?name= override.
  const ssrSupabase = await createServerSupabase();
  const {
    data: { user: authUser },
  } = await ssrSupabase.auth.getUser();
  let googleName: string | null = null;
  if (authUser) {
    const meta = authUser.user_metadata as Record<string, unknown> | undefined;
    const fullName = (meta?.full_name as string | undefined) ?? (meta?.name as string | undefined);
    const givenName = meta?.given_name as string | undefined;
    const familyName = meta?.family_name as string | undefined;
    googleName =
      (fullName && fullName.trim()) ||
      ([givenName, familyName].filter(Boolean).join(" ").trim() || null) ||
      authUser.email ||
      null;
  }

  const sessionIds = await getReadableSessionIds(session.id);
  const [attemptsRes, achievementsRes, programsRes] = await Promise.all([
    supabase
      .from("challenge_attempts")
      .select("outcome, resolved_at")
      .in("session_id", sessionIds),
    supabase
      .from("achievements_unlocked")
      .select("achievement_id, unlocked_at")
      .in("session_id", sessionIds)
      .order("unlocked_at", { ascending: true }),
    supabase
      .from("program_progress")
      .select("program_id, step_index")
      .in("session_id", sessionIds),
  ]);

  const attempts = attemptsRes.data ?? [];
  const completedAttempts = attempts.filter((a) => a.outcome === "completed");
  const totalCompleted = completedAttempts.length;
  const level = getLevel(totalCompleted);

  let memberSince: string | null = null;
  for (const a of completedAttempts) {
    if (!a.resolved_at) continue;
    if (!memberSince || a.resolved_at < memberSince) memberSince = a.resolved_at;
  }

  const unlockedSet = new Set((achievementsRes.data ?? []).map((r) => r.achievement_id));
  const achievementBadges = ACHIEVEMENTS
    .filter((a) => unlockedSet.has(a.id))
    .map((a) => ({
      id: a.id,
      emoji: a.emoji,
      title: t(`achievements.items.${a.id}.title` as const),
    }));

  const programStepMax = new Map<string, number>();
  for (const row of programsRes.data ?? []) {
    const cur = programStepMax.get(row.program_id) ?? -1;
    if (row.step_index > cur) programStepMax.set(row.program_id, row.step_index);
  }
  const completedPrograms = PROGRAMS
    .filter((p) => (programStepMax.get(p.id) ?? -1) + 1 >= p.cardIds.length)
    .map((p) => ({ id: p.id, emoji: p.emoji, title: t(`programs.items.${p.id}.title` as const) }));

  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  // Resolution order: explicit ?name= override → Google profile → empty (shows "Anonymous").
  const overrideName = (name ?? "").trim();
  const playerName = (overrideName || (googleName ?? "")).slice(0, 60);

  return (
    <main id="main" className="min-h-screen bg-muted/30">
      {/* Print controls — hidden when printing */}
      <div className="mx-auto max-w-4xl px-4 pt-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`${localePrefix}/jeu/profil`}>← {t("certificate.back")}</Link>
          </Button>
          <NameForm
            currentName={playerName}
            placeholder={t("certificate.namePlaceholder")}
            label={t("certificate.nameLabel")}
            updateLabel={t("certificate.nameUpdate")}
          />
          <PrintButton label={t("certificate.print")} />
        </div>
      </div>

      <Certificate
        playerName={playerName}
        level={{
          label: t(`levels.${level.current.id}.label` as const),
          subtitle: t(`levels.${level.current.id}.subtitle` as const),
        }}
        totalCompleted={totalCompleted}
        memberSinceISO={memberSince}
        achievements={achievementBadges}
        completedPrograms={completedPrograms}
        labels={{
          headline: t("certificate.headline"),
          subhead: t("certificate.subhead"),
          quote: t("certificate.quote", { n: totalCompleted }),
          memberSince: t("certificate.memberSince"),
          achievementsTitle: t("certificate.achievementsTitle"),
          programsTitle: t("certificate.programsTitle"),
          noProgramsYet: t("certificate.noProgramsYet"),
          footer: t("certificate.footer"),
          unnamed: t("certificate.unnamed"),
        }}
        locale={locale}
      />
    </main>
  );
}

/* --- Tiny client islands kept inline so this page stays as a Server Component for SEO. --- */

function NameForm({
  currentName,
  placeholder,
  label,
  updateLabel,
}: {
  currentName: string;
  placeholder: string;
  label: string;
  updateLabel: string;
}) {
  return (
    <form className="flex items-center gap-2" method="GET">
      <label htmlFor="cert-name" className="sr-only">
        {label}
      </label>
      <input
        id="cert-name"
        name="name"
        type="text"
        defaultValue={currentName}
        placeholder={placeholder}
        maxLength={60}
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="submit"
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
      >
        {updateLabel}
      </button>
    </form>
  );
}


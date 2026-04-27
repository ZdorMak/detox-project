import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getReadableSessionIds } from "@/lib/user-sessions";
import { getCard } from "@/lib/challenges/cards";
import { getProgram } from "@/lib/challenges/programs";
import { ProgramRunner } from "@/components/challenges/ProgramRunner";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const program = getProgram(id);
  if (!program) return { title: "Program" };
  const t = await getTranslations({ locale, namespace: "challenges.programs.items" });
  return { title: t(`${id}.title` as const) };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "challenges" });

  const program = getProgram(id);
  if (!program) notFound();

  const session = await getOrCreateSession();
  const supabase = createAdminClient();
  const sessionIds = await getReadableSessionIds(session.id);

  const { data: rows } = await supabase
    .from("program_progress")
    .select("step_index")
    .in("session_id", sessionIds)
    .eq("program_id", id);

  const stepIndex = (rows ?? []).reduce(
    (max, r) => Math.max(max, r.step_index + 1),
    0,
  );

  const localePrefix = locale === "fr" ? "" : `/${locale}`;

  // If completed → take them to the certificate.
  if (stepIndex >= program.cardIds.length) {
    redirect(`${localePrefix}/jeu/certificat`);
  }

  const cardId = program.cardIds[stepIndex]!;
  const card = getCard(cardId);
  if (!card) notFound();

  return (
    <main id="main" className="mx-auto max-w-xl px-4 py-8">
      <header className="mb-6 text-center">
        <Link
          href={`${localePrefix}/jeu/programmes`}
          className="text-xs text-muted-foreground hover:underline"
        >
          ← {t("programs.backToList")}
        </Link>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          <span className="mr-2" aria-hidden="true">{program.emoji}</span>
          {t(`programs.items.${program.id}.title` as const)}
        </h1>
        <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
          {t("programs.stepOf", {
            current: stepIndex + 1,
            total: program.cardIds.length,
          })}
        </p>
      </header>

      <ProgramRunner
        programId={program.id}
        stepIndex={stepIndex}
        totalSteps={program.cardIds.length}
        card={card}
        homeHref={`${localePrefix}/jeu/programmes`}
        profileHref={`${localePrefix}/jeu/profil`}
      />
    </main>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { getChallengeStats, pickNextCard } from "@/lib/challenges/state";
import { Game } from "@/components/challenges/Game";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "challenges" });
  return { title: t("metadata.title") };
}

export default async function ChallengesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "challenges" });

  const session = await getOrCreateSession();
  const stats = await getChallengeStats(session.id);
  const initialCard = pickNextCard(stats);

  const localePrefix = locale === "fr" ? "" : `/${locale}`;

  return (
    <main id="main">
      <header className="mx-auto max-w-xl px-4 pb-2 pt-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-balance text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      <Game
        initialCard={initialCard}
        initialCompleted={stats.totalCompleted}
        initialSkipped={stats.totalSkipped}
        homeHref={`${localePrefix}/`}
      />
    </main>
  );
}

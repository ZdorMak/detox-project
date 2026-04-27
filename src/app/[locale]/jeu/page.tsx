import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { getChallengeStats, pickNextCard } from "@/lib/challenges/state";
import { getLevel } from "@/lib/challenges/levels";
import { Game } from "@/components/challenges/Game";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileGameNav } from "@/components/challenges/MobileGameNav";

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
  const defaultLocation = "home";
  const initialCard = pickNextCard(stats, defaultLocation);
  const level = getLevel(stats.totalCompleted);

  const localePrefix = locale === "fr" ? "" : `/${locale}`;

  return (
    <>
      <SiteHeader locale={locale} next={`${localePrefix}/jeu`} />
      <main id="main" className="pb-20 md:pb-0">
        <header className="mx-auto max-w-xl px-4 pb-2 pt-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-balance text-sm text-muted-foreground">
          {t("subtitle")}
        </p>

        {/* Level pill + nav */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-100">
            <span aria-hidden="true">🏅</span>
            {t(`levels.${level.current.id}.label` as const)}
          </span>
          <Button asChild variant="ghost" size="sm">
            <Link href={`${localePrefix}/jeu/programmes`}>
              {t("nav.programs")}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`${localePrefix}/jeu/profil`}>
              {t("nav.profile")}
            </Link>
          </Button>
        </div>
      </header>

        <Game
          initialCard={initialCard}
          initialCompleted={stats.totalCompleted}
          initialSkipped={stats.totalSkipped}
          initialLocation={defaultLocation}
          homeHref={`${localePrefix}/`}
          profileHref={`${localePrefix}/jeu/profil`}
        />
      </main>
      <MobileGameNav locale={locale} active="cards" />
    </>
  );
}

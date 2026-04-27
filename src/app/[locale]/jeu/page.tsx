import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { getChallengeStats, pickNextCard } from "@/lib/challenges/state";
import { timeOfDayFromHour } from "@/lib/challenges/cards";
import { Game } from "@/components/challenges/Game";
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
  const serverHour = (new Date().getUTCHours() + 1) % 24;
  const initialCard = pickNextCard(stats, defaultLocation, timeOfDayFromHour(serverHour));

  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  const drawn = stats.totalCompleted + stats.totalSkipped + stats.totalDeclined;

  return (
    <>
      <SiteHeader locale={locale} next={`${localePrefix}/jeu`} />
      <main id="main" className="cards-screen pb-20 md:pb-0">
        <div
          className="mx-auto max-w-[1200px] px-8 py-[60px]"
          style={{ paddingLeft: "var(--pad-x)", paddingRight: "var(--pad-x)" }}
        >
          <div className="mb-6">
            <div
              className="cd-mono mb-3 flex items-center gap-3.5"
              style={{ color: "var(--fg-3)" }}
            >
              <span className="cd-dim">{String(drawn + 1).padStart(2, "0")}</span>
              <span className="h-px w-20" style={{ background: "var(--line-2)" }} />
              <span>{t("cardsHeaderEyebrow", { current: drawn + 1, total: 50 })}</span>
            </div>
            <h1
              className="font-display max-w-[16ch] text-balance leading-[0.96]"
              style={{
                fontSize: "clamp(48px, 6vw, 96px)",
                letterSpacing: "-0.03em",
                marginBottom: 20,
              }}
            >
              {t("cardsTitlePart1")}{" "}
              <em>{t("cardsTitleAccent")}</em>
            </h1>
            <p
              className="mb-16 max-w-[50ch] text-[17px]"
              style={{ color: "var(--fg-2)" }}
            >
              {t("cardsSub")}
            </p>
          </div>

          <Game
            initialCard={initialCard}
            initialCompleted={stats.totalCompleted}
            initialSkipped={stats.totalSkipped}
            initialLocation={defaultLocation}
            homeHref={`${localePrefix}/`}
            profileHref={`${localePrefix}/jeu/profil`}
          />
        </div>
      </main>
      <MobileGameNav locale={locale} active="cards" />
    </>
  );
}

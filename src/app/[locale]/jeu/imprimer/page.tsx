import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CHALLENGE_CARDS, ALL_LOCATIONS } from "@/lib/challenges/cards";
import { PrintableDeck } from "@/components/challenges/PrintableDeck";
import { PrintButton } from "@/components/challenges/PrintButton";
import { PrintSizeControl } from "@/components/challenges/PrintSizeControl";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "challenges.print" });
  return { title: t("metadata.title") };
}

export default async function PrintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "challenges" });

  // Pre-translate every card title + body server-side so the print component
  // stays presentational (no hooks).
  const cardTexts: Record<string, { title: string; body: string }> = {};
  for (const card of CHALLENGE_CARDS) {
    cardTexts[card.id] = {
      title: t(`cards.${card.id}.title` as const),
      body: t(`cards.${card.id}.body` as const),
    };
  }

  const categories: Record<string, string> = {
    observation: t("categories.observation"),
    social: t("categories.social"),
    movement: t("categories.movement"),
    creative: t("categories.creative"),
    reflection: t("categories.reflection"),
  };
  const locations: Record<string, string> = {};
  for (const loc of ALL_LOCATIONS) {
    locations[loc] = t(`locations.options.${loc}` as const);
  }

  const localePrefix = locale === "fr" ? "" : `/${locale}`;

  // Six rules; expressed as an array so the i18n keeps each line addressable.
  const rulesList: string[] = [
    t("print.rules.1"),
    t("print.rules.2"),
    t("print.rules.3"),
    t("print.rules.4"),
    t("print.rules.5"),
    t("print.rules.6"),
  ];

  return (
    <main id="main" className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Toolbar — hidden when printing */}
      <div className="border-b border-border bg-background px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`${localePrefix}/jeu`}>← {t("print.backToGame")}</Link>
          </Button>
          <PrintSizeControl label={t("print.sizeLabel")} />
          <PrintButton label={t("print.printAction")} />
        </div>
        <p className="mx-auto mt-2 max-w-5xl text-xs text-muted-foreground">
          {t("print.tip")}
        </p>
      </div>

      <div className="py-6 print:py-0">
        <PrintableDeck
          cardTexts={cardTexts}
          labels={{
            pageTitle: t("print.pageTitle"),
            rulesHeading: t("print.rulesHeading"),
            rulesIntro: t("print.rulesIntro"),
            rulesList,
            legendCategoriesHeading: t("print.legendCategories"),
            legendLocationsHeading: t("print.legendLocations"),
            footer: t("print.footer"),
            categories,
            locations,
          }}
        />
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { deriveResult, getSurveyState } from "@/lib/survey/state";
import { SAS_SV_MAX_SCORE, SAS_SV_MIN_SCORE, type RiskBand, type SasSymptom } from "@/lib/survey/sas-sv";
import { ResourcesBlock } from "@/components/results/ResourcesBlock";
import { Button } from "@/components/ui/button";
import { retakeAction } from "./actions";

export const dynamic = "force-dynamic";

const SYMPTOM_ORDER: SasSymptom[] = [
  "loss_of_control",
  "disruption",
  "preoccupation",
  "withdrawal",
  "tolerance",
  "disregard",
];

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "results" });

  const session = await getOrCreateSession();
  const state = await getSurveyState(session.id);

  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  if (!state.isComplete) {
    // Resume in the survey if there are unanswered items.
    redirect(`${localePrefix}/survey`);
  }

  const result = deriveResult(state.answers);
  const pct = Math.round(
    ((result.totalScore - SAS_SV_MIN_SCORE) /
      (SAS_SV_MAX_SCORE - SAS_SV_MIN_SCORE)) *
      100,
  );

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("instrumentNote")}
        </p>
      </header>

      <ScoreCard
        score={result.totalScore}
        max={SAS_SV_MAX_SCORE}
        pct={pct}
        band={result.band}
        labels={{
          scoreLabel: t("score.label"),
          rangeLabel: t("score.range", { min: SAS_SV_MIN_SCORE, max: SAS_SV_MAX_SCORE }),
          bandHeading: t(`bands.${result.band}.heading` as const),
          bandBody: t(`bands.${result.band}.body` as const),
          bandReflect: t(`bands.${result.band}.reflect` as const),
        }}
      />

      <section className="mt-8" aria-labelledby="symptoms-heading">
        <h2 id="symptoms-heading" className="text-lg font-semibold">
          {t("symptoms.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("symptoms.subtitle")}
        </p>
        <ul className="mt-4 space-y-3">
          {SYMPTOM_ORDER.map((sym) => {
            const itemsForSym = countItemsForSymptom(sym);
            const subscore = result.bySymptom[sym];
            const subPct = Math.round((subscore / (itemsForSym * 6)) * 100);
            return (
              <li key={sym}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">
                    {t(`symptoms.items.${sym}` as const)}
                  </span>
                  <span className="text-muted-foreground">
                    {subscore} / {itemsForSym * 6}
                  </span>
                </div>
                <div
                  className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-valuenow={subPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t(`symptoms.items.${sym}` as const)}
                >
                  <div
                    className={
                      "h-full transition-all " + bandToBarClass(result.band)
                    }
                    style={{ width: `${subPct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <ResourcesBlock />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <form action={retakeAction}>
          <input type="hidden" name="localePrefix" value={localePrefix} />
          <Button type="submit" variant="outline">
            {t("actions.retake")}
          </Button>
        </form>
        <Button asChild>
          <Link href={`${localePrefix}/`}>{t("actions.home")}</Link>
        </Button>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">{t("disclaimer")}</p>
    </main>
  );
}

interface ScoreCardProps {
  score: number;
  max: number;
  pct: number;
  band: RiskBand;
  labels: {
    scoreLabel: string;
    rangeLabel: string;
    bandHeading: string;
    bandBody: string;
    bandReflect: string;
  };
}

function ScoreCard({ score, max, pct, band, labels }: ScoreCardProps) {
  return (
    <section
      className="rounded-lg border border-border bg-card p-6"
      aria-labelledby="score-heading"
    >
      <h2 id="score-heading" className="sr-only">
        {labels.scoreLabel}
      </h2>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {labels.scoreLabel}
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums">
            {score}
            <span className="ml-1 text-base font-medium text-muted-foreground">
              / {max}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{labels.rangeLabel}</p>
        </div>
        <div
          className={
            "rounded-full px-3 py-1 text-sm font-medium " + bandToPillClass(band)
          }
          aria-label={labels.bandHeading}
        >
          {labels.bandHeading}
        </div>
      </div>

      <div
        className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={"h-full transition-all " + bandToBarClass(band)}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-4 text-sm leading-relaxed">{labels.bandBody}</p>
      <p className="mt-3 rounded-md bg-muted/40 p-3 text-sm leading-relaxed">
        💡 {labels.bandReflect}
      </p>
    </section>
  );
}

function countItemsForSymptom(sym: SasSymptom): number {
  switch (sym) {
    case "loss_of_control":
    case "disruption":
    case "disregard":
    case "withdrawal":
      return 2;
    case "preoccupation":
    case "tolerance":
      return 1;
  }
}

function bandToPillClass(band: RiskBand): string {
  switch (band) {
    case "low":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100";
    case "moderate":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100";
    case "high":
      return "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100";
  }
}

function bandToBarClass(band: RiskBand): string {
  switch (band) {
    case "low":
      return "bg-emerald-500";
    case "moderate":
      return "bg-amber-500";
    case "high":
      return "bg-rose-500";
  }
}

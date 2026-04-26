import { redirect } from "next/navigation";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { deriveResult, getSurveyState } from "@/lib/survey/state";
import {
  SAS_SV_MAX_SCORE,
  SAS_SV_MIN_SCORE,
  type SasSymptom,
} from "@/lib/survey/sas-sv";
import { pickPersona } from "@/lib/survey/personas";
import { ResourcesBlock } from "@/components/results/ResourcesBlock";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import { SymptomRadar } from "@/components/results/SymptomRadar";
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
    redirect(`${localePrefix}/survey`);
  }

  const result = deriveResult(state.answers);
  const pct = Math.round(
    ((result.totalScore - SAS_SV_MIN_SCORE) /
      (SAS_SV_MAX_SCORE - SAS_SV_MIN_SCORE)) *
      100,
  );

  const radarData = SYMPTOM_ORDER.map((sym) => ({
    symptom: t(`symptoms.items.${sym}` as const),
    score: result.bySymptom[sym],
    max: countItemsForSymptom(sym) * 6,
  }));

  // Quick stats — drives the small KPI strip under the gauge.
  const dominantSymptom = [...radarData].sort(
    (a, b) => b.score / b.max - a.score / a.max,
  )[0]!;
  const lowestSymptom = [...radarData].sort(
    (a, b) => a.score / a.max - b.score / b.max,
  )[0]!;
  const averagePct = Math.round(
    radarData.reduce((acc, d) => acc + (d.score / d.max) * 100, 0) /
      radarData.length,
  );

  const persona = pickPersona(result.band, result.bySymptom);

  return (
    <main id="main" className="min-h-screen bg-background">
      {/* HERO — persona banner with gradient and gauge */}
      <section
        className="relative isolate overflow-hidden border-b border-border text-white"
        style={{
          background: `linear-gradient(135deg, ${persona.fromColor} 0%, ${persona.toColor} 100%)`,
        }}
      >
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />

        <div className="container relative mx-auto max-w-4xl px-4 py-12 text-center sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
            {t("personaPreface")}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-5xl drop-shadow-lg" aria-hidden="true">
              {persona.emoji}
            </span>
            <h1 className="font-display text-balance text-4xl font-bold leading-tight drop-shadow-lg sm:text-6xl">
              {t(`personas.${persona.id}.title` as const)}
            </h1>
          </div>
          <p className="mx-auto mt-3 max-w-xl text-balance text-base text-white/85 sm:text-lg">
            {t(`personas.${persona.id}.tagline` as const)}
          </p>

          <div className="mt-10 inline-block rounded-3xl bg-white/95 p-6 text-foreground shadow-2xl dark:bg-slate-900/95">
            <ScoreGauge
              score={result.totalScore}
              min={SAS_SV_MIN_SCORE}
              max={SAS_SV_MAX_SCORE}
              band={result.band}
              bandLabel={t(`bands.${result.band}.heading` as const)}
              scoreLabel={t("score.label")}
              rangeLabel={t("score.range", { min: SAS_SV_MIN_SCORE, max: SAS_SV_MAX_SCORE })}
            />
          </div>
        </div>
      </section>

      {/* Persona description */}
      <section className="container mx-auto max-w-3xl px-4 pt-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            {t("personaAboutHeading")}
          </p>
          <p className="mt-3 text-base leading-relaxed sm:text-lg">
            {t(`personas.${persona.id}.description` as const)}
          </p>
        </div>
      </section>

      {/* KPI strip — three quick numbers */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Kpi
              valueText={`${pct}%`}
              label={t("score.label")}
              accent="text-rose-600 dark:text-rose-400"
            />
            <Kpi
              valueText={`${averagePct}%`}
              label={t("symptoms.title")}
              accent="text-amber-600 dark:text-amber-400"
            />
            <Kpi
              valueText={dominantSymptom.symptom}
              valueClass="text-lg sm:text-xl"
              label={t("symptoms.subtitle")}
              accent="text-indigo-600 dark:text-indigo-400"
            />
          </div>
        </div>
      </section>

      {/* Band interpretation */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {t(`bands.${result.band}.heading` as const)}
          </h2>
          <p className="mt-3 text-base leading-relaxed">
            {t(`bands.${result.band}.body` as const)}
          </p>
          <p className="mt-4 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed">
            💡 {t(`bands.${result.band}.reflect` as const)}
          </p>
        </div>
      </section>

      {/* Radar + breakdown side by side */}
      <section className="container mx-auto max-w-5xl px-4 pb-12" aria-labelledby="symptoms-heading">
        <div className="text-center">
          <h2 id="symptoms-heading" className="font-display text-2xl font-bold sm:text-3xl">
            {t("symptoms.title")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            {t("symptoms.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* Radar chart */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <SymptomRadar data={radarData} band={result.band} />
          </div>

          {/* Numerical breakdown */}
          <ul className="space-y-4">
            {radarData
              .map((d) => ({ ...d, pctd: Math.round((d.score / d.max) * 100) }))
              .sort((a, b) => b.pctd - a.pctd)
              .map((d) => {
                const isTop = d === dominantSymptom;
                const isLow = d === lowestSymptom;
                return (
                  <li
                    key={d.symptom}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-base font-semibold">
                        {d.symptom}
                        {isTop && <span className="ml-2 text-xs font-normal text-rose-600">▲ top</span>}
                        {isLow && !isTop && (
                          <span className="ml-2 text-xs font-normal text-emerald-600">▼ low</span>
                        )}
                      </span>
                      <span className="font-display text-lg font-bold tabular-nums">
                        {d.pctd}
                        <span className="ml-0.5 text-sm font-medium text-muted-foreground">%</span>
                      </span>
                    </div>
                    <div
                      className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
                      role="progressbar"
                      aria-valuenow={d.pctd}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={d.symptom}
                    >
                      <div
                        className={"h-full transition-all " + bandToBarClass(result.band)}
                        style={{ width: `${d.pctd}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.score} / {d.max}
                    </p>
                  </li>
                );
              })}
          </ul>
        </div>
      </section>

      {/* Resources */}
      <section className="container mx-auto max-w-3xl px-4 pb-12">
        <ResourcesBlock />
      </section>

      {/* Actions */}
      <section className="container mx-auto max-w-3xl px-4 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <form action={retakeAction}>
            <input type="hidden" name="localePrefix" value={localePrefix} />
            <Button type="submit" variant="outline" size="lg">
              {t("actions.retake")}
            </Button>
          </form>
          <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md hover:from-emerald-700 hover:to-teal-700">
            <Link href={`${localePrefix}/jeu`}>🎴 Pose le téléphone</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href={`${localePrefix}/`}>{t("actions.home")}</Link>
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          {t("disclaimer")}
        </p>
      </section>
    </main>
  );
}

function Kpi({
  valueText,
  valueClass,
  label,
  accent,
}: {
  valueText: string;
  valueClass?: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
      <p
        className={`font-display tabular-nums leading-none ${accent} ${valueClass ?? "text-3xl sm:text-4xl"} font-bold`}
      >
        {valueText}
      </p>
      <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
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

function bandToBarClass(band: "low" | "moderate" | "high"): string {
  switch (band) {
    case "low":
      return "bg-gradient-to-r from-emerald-500 to-teal-500";
    case "moderate":
      return "bg-gradient-to-r from-amber-500 to-orange-500";
    case "high":
      return "bg-gradient-to-r from-rose-500 to-orange-500";
  }
}

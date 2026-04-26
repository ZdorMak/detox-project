import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { getSurveyState } from "@/lib/survey/state";
import { SurveyClient } from "@/components/survey/SurveyClient";

export const dynamic = "force-dynamic";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "survey" });

  // Bootstrap or read the anonymous session, and check resume state.
  const session = await getOrCreateSession();
  const state = await getSurveyState(session.id);

  // W2-6 resume: if the survey is already complete, send straight to results.
  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  if (state.isComplete) {
    redirect(`${localePrefix}/results`);
  }

  return (
    <main id="main" className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-rose-50 via-background to-amber-50 dark:from-rose-950/20 dark:to-amber-950/20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl"
        />
        <header className="container relative mx-auto max-w-3xl px-4 py-12 text-center sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700 dark:text-rose-300">
            SAS-SV
          </p>
          <h1 className="font-display mt-3 text-balance text-3xl font-bold leading-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
        </header>
      </div>

      <SurveyClient
        initialAnswers={state.answers}
        initialNextItemId={state.nextItemId}
        resultsHref={`${localePrefix}/results`}
      />
    </main>
  );
}

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
    <main id="main">
      <header className="mx-auto max-w-3xl px-4 pb-2 pt-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <SurveyClient
        initialAnswers={state.answers}
        initialNextItemId={state.nextItemId}
        resultsHref={`${localePrefix}/results`}
      />
    </main>
  );
}

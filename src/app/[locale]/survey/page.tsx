import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { getSurveyState } from "@/lib/survey/state";
import { SurveyClient } from "@/components/survey/SurveyClient";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const dynamic = "force-dynamic";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getOrCreateSession();
  const state = await getSurveyState(session.id);

  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  if (state.isComplete) {
    redirect(`${localePrefix}/results`);
  }

  return (
    <>
      <SiteHeader locale={locale} next={`${localePrefix}/survey`} />
      <main id="main">
        <SurveyClient
          initialAnswers={state.answers}
          initialNextItemId={state.nextItemId}
          resultsHref={`${localePrefix}/results`}
        />
      </main>
    </>
  );
}

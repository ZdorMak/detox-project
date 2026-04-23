import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { getSurveyState } from "@/lib/survey/state";
import { Experience } from "@/components/experience/Experience";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experience" });
  return { title: t("metadata.title") };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Bootstrap session and check resume state — if survey is already complete,
  // skip the experience and go straight to results.
  const session = await getOrCreateSession();
  const state = await getSurveyState(session.id);

  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  if (state.isComplete) {
    redirect(`${localePrefix}/results`);
  }

  return <Experience surveyHref={`${localePrefix}/survey`} />;
}

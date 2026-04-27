import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { Pillars } from "@/components/landing/pillars";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Footer } from "@/components/landing/footer";
import { ConsentBanner } from "@/components/consent/consent-banner";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const localePrefix = locale === "fr" ? "" : `/${locale}`;

  return (
    <>
      <SiteHeader locale={locale} next={`${localePrefix}/`} hideBrand />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Stats />
        <Pillars />
        <CtaBanner />
      </main>
      <Footer />
      <ConsentBanner />
    </>
  );
}

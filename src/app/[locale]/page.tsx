import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/hero";
import { Pillars } from "@/components/landing/pillars";
import { Footer } from "@/components/landing/footer";
import { ConsentBanner } from "@/components/consent/consent-banner";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <main id="main">
        <Hero />
        <Pillars />
      </main>
      <Footer />
      <ConsentBanner />
    </>
  );
}

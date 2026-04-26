import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/hero";
import { Pillars } from "@/components/landing/pillars";
import { Footer } from "@/components/landing/footer";
import { ConsentBanner } from "@/components/consent/consent-banner";
import { UserMenu } from "@/components/auth/UserMenu";

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
      <div className="absolute right-4 top-4 z-20">
        <UserMenu locale={locale} next={`${localePrefix}/`} />
      </div>
      <main id="main">
        <Hero />
        <Pillars />
      </main>
      <Footer />
      <ConsentBanner />
    </>
  );
}

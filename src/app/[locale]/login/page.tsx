import { setRequestLocale, getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("metadata.title") };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { next, error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "auth" });

  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  const safeNext = sanitizeNext(next, localePrefix);

  return (
    <main id="main" className="mx-auto max-w-md px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("login.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("login.subtitle")}</p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-100"
        >
          {t(`login.errors.${error}` as const, { fallback: t("login.errors.generic") })}
        </div>
      )}

      <LoginForm next={safeNext} labels={{
        google: t("login.google"),
      }} />

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {t("login.consent")}
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {t("login.skipPrompt")}{" "}
        <a href={`${localePrefix}/jeu`} className="underline hover:text-foreground">
          {t("login.skipLink")}
        </a>
      </p>
    </main>
  );
}

/**
 * Only allow `next` values that are same-origin and start with the current
 * locale prefix (or "/"). Prevents open-redirect attacks.
 */
function sanitizeNext(raw: string | undefined, localePrefix: string): string {
  if (!raw || typeof raw !== "string") return `${localePrefix}/jeu`;
  if (!raw.startsWith("/")) return `${localePrefix}/jeu`;
  if (raw.startsWith("//")) return `${localePrefix}/jeu`;
  return raw;
}

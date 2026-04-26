import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  locale: string;
  /** Where to send the user back to after sign-in. Defaults to current page. */
  next?: string;
}

/**
 * Server-rendered user chip.
 *  - Signed in: shows initial + display name + Sign out form.
 *  - Signed out: shows "Sign in" link with `next` preserved.
 *
 * Designed to live in the page header / footer as a small floating element.
 */
export async function UserMenu({ locale, next }: UserMenuProps) {
  const t = await getTranslations({ locale, namespace: "auth.menu" });
  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginHref = next
      ? `${localePrefix}/login?next=${encodeURIComponent(next)}`
      : `${localePrefix}/login`;
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href={loginHref}>{t("signIn")}</Link>
      </Button>
    );
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "?";
  const initial = (displayName.trim()[0] ?? "?").toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
        title={displayName}
      >
        {initial}
      </div>
      <span className="hidden text-sm sm:inline" title={displayName}>
        {displayName.length > 24 ? displayName.slice(0, 22) + "…" : displayName}
      </span>
      <form action="/auth/signout" method="POST">
        <Button type="submit" variant="ghost" size="sm">
          {t("signOut")}
        </Button>
      </form>
    </div>
  );
}

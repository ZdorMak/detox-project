import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

interface SiteHeaderProps {
  locale: string;
  /** Where to send the user back to after sign-in. */
  next?: string;
  /** Hide the brand link on landing where the hero already shows it. */
  hideBrand?: boolean;
}

/**
 * Sticky top bar present on every page. On mobile (default), it's a slim
 * 56px bar with brand + theme toggle + user menu. On desktop, the same
 * shape — just more breathing room. Replaces the older absolute-positioned
 * floating chips that overlapped headings on small screens.
 */
export function SiteHeader({ locale, next, hideBrand = false }: SiteHeaderProps) {
  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        {!hideBrand ? (
          <Link
            href={`${localePrefix}/`}
            className="text-primary transition-opacity hover:opacity-80"
          >
            <BrandLogo size={28} withWordmark />
          </Link>
        ) : (
          <span className="h-7 w-16" aria-hidden="true" />
        )}
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <UserMenu locale={locale} next={next} />
        </div>
      </div>
    </header>
  );
}

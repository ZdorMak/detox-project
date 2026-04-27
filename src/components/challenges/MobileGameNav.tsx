import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Layers, GalleryThumbnails, UserCircle } from "lucide-react";

interface MobileGameNavProps {
  locale: string;
  /** Currently-active route — pass "cards" / "programs" / "profile". */
  active: "cards" | "programs" | "profile";
}

/**
 * Bottom tab bar shown on /jeu, /jeu/programmes, /jeu/profil.
 *
 * - Mobile: fixed at the bottom, full width, 4 tabs.
 * - Desktop: hidden — the existing in-page nav covers it.
 *
 * Uses safe-area-inset-bottom so the bar doesn't collide with iOS home
 * indicator. Server-rendered with the active tab pre-marked.
 */
export async function MobileGameNav({ locale, active }: MobileGameNavProps) {
  const t = await getTranslations({ locale, namespace: "challenges" });
  const localePrefix = locale === "fr" ? "" : `/${locale}`;

  const tabs = [
    {
      key: "cards" as const,
      href: `${localePrefix}/jeu`,
      label: t("title"),
      Icon: Layers,
    },
    {
      key: "programs" as const,
      href: `${localePrefix}/jeu/programmes`,
      label: t("nav.programs"),
      Icon: GalleryThumbnails,
    },
    {
      key: "profile" as const,
      href: `${localePrefix}/jeu/profil`,
      label: t("nav.profile"),
      Icon: UserCircle,
    },
  ];

  return (
    <nav
      aria-label="Game"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {tabs.map(({ key, href, label, Icon }) => {
          const isActive = key === active;
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={
                  "flex flex-col items-center justify-center gap-1 px-2 py-3 text-[10px] font-medium leading-tight transition-colors " +
                  (isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.4 : 1.75}
                  aria-hidden="true"
                />
                <span className="text-center">{label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-8 -translate-y-px rounded-full bg-primary"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

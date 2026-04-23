import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="mt-16 border-t border-border bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4 py-8 text-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">{t("tagline")}</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href="mailto:detox-project@example.org"
              className="text-foreground hover:underline"
            >
              {t("contact")}
            </a>
            <a
              href="https://github.com/ZdorMak/detox-project"
              className="text-foreground hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("github")}
            </a>
          </nav>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{t("rights")}</p>
      </div>
    </footer>
  );
}

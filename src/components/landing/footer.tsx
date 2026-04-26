import { useTranslations } from "next-intl";
import { Github, Mail, BookOpen } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="mt-16 border-t border-border bg-gradient-to-b from-muted/20 to-muted/40">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand + tagline */}
          <div>
            <p className="font-display text-lg font-bold leading-tight">Detox</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Liens
            </p>
            <a
              href="mailto:detox-project@example.org"
              className="inline-flex items-center gap-2 text-foreground hover:text-primary"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("contact")}
            </a>
            <a
              href="https://github.com/ZdorMak/detox-project"
              className="inline-flex items-center gap-2 text-foreground hover:text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              {t("github")}
            </a>
          </nav>

          {/* Project info */}
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Projet
            </p>
            <p className="inline-flex items-center gap-2 text-foreground">
              <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              HEFP · SOUK 2026
            </p>
            <p className="text-xs text-muted-foreground">
              Suisse romande · 100 % anonyme
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>{t("rights")}</p>
          <p className="font-display tracking-wide">v0.1 · made with care</p>
        </div>
      </div>
    </footer>
  );
}

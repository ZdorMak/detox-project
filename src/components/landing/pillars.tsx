import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  Brain,
  Users,
  Sparkles,
  Smartphone,
  Atom,
  Accessibility,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PillarSpec {
  key: string;
  Icon: LucideIcon;
  /** Tailwind colour class for the icon — maps to the pillar palette. */
  colorClass: string;
}

// Order matches the brief's seven mandatory pillars.
const PILLARS: PillarSpec[] = [
  { key: "durable", Icon: ShieldCheck, colorClass: "text-pillar-durable" },
  { key: "addiction", Icon: Brain, colorClass: "text-pillar-addiction" },
  { key: "collaboration", Icon: Users, colorClass: "text-pillar-collab" },
  { key: "innovation", Icon: Sparkles, colorClass: "text-pillar-innovation" },
  { key: "smartphone", Icon: Smartphone, colorClass: "text-pillar-smartphone" },
  { key: "interdisciplinaire", Icon: Atom, colorClass: "text-pillar-interdisciplinaire" },
  { key: "accessible", Icon: Accessibility, colorClass: "text-pillar-accessible" },
];

export function Pillars() {
  const t = useTranslations("landing.pillars");

  return (
    <section
      id="pillars"
      aria-labelledby="pillars-heading"
      className="container mx-auto max-w-6xl px-4 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="pillars-heading" className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-balance text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ul
        role="list"
        className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {PILLARS.map(({ key, Icon, colorClass }) => (
          <li key={key}>
            <Card className="h-full">
              <CardHeader>
                <div
                  aria-hidden="true"
                  className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted"
                >
                  <Icon className={`h-5 w-5 ${colorClass}`} />
                </div>
                <CardTitle>{t(`items.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t(`items.${key}.description`)}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}

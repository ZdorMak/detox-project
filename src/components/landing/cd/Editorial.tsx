import { useTranslations } from "next-intl";

/**
 * Editorial blockquote section — "what's at stake".
 * Huge italic display quote, oversized 200px quote-mark, meta column on
 * the right with mono labels and dotted dividers.
 */
export function Editorial() {
  const t = useTranslations("landing.editorial");
  const meta: Array<[string, string]> = [
    [t("meta.method.label"), t("meta.method.value")],
    [t("meta.reading.label"), t("meta.reading.value")],
    [t("meta.identity.label"), t("meta.identity.value")],
    [t("meta.storage.label"), t("meta.storage.value")],
    [t("meta.access.label"), t("meta.access.value")],
    [t("meta.source.label"), t("meta.source.value")],
  ];
  return (
    <section
      className="border-t"
      style={{
        borderColor: "var(--line)",
        background: "var(--bg-2)",
        padding: "100px var(--pad-x)",
      }}
    >
      <div className="grid items-start gap-20 md:grid-cols-[1.4fr_1fr]">
        <div className="relative">
          <div
            className="font-display absolute italic"
            style={{
              top: 0,
              left: -20,
              fontSize: 200,
              lineHeight: 0.5,
              color: "var(--cd-accent)",
              opacity: 0.4,
            }}
            aria-hidden="true"
          >
            &ldquo;
          </div>
          <blockquote
            className="font-display max-w-[28ch] m-0 mt-15 text-pretty"
            style={{
              fontSize: "clamp(28px, 3.4vw, 48px)",
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              marginTop: 60,
              marginBottom: 28,
              padding: 0,
            }}
          >
            {t.rich("quote", {
              em: (chunks) => <em>{chunks}</em>,
            })}
          </blockquote>
          <div className="cd-mono cd-dim">— {t("attribution")}</div>
        </div>
        <div className="flex flex-col">
          {meta.map(([label, value], i) => (
            <div
              key={i}
              className="grid gap-6 py-4.5 text-sm"
              style={{
                gridTemplateColumns: "140px 1fr",
                paddingTop: 18,
                paddingBottom: 18,
                borderTop: "1px solid var(--line)",
                borderBottom: i === meta.length - 1 ? "1px solid var(--line)" : undefined,
              }}
            >
              <span className="cd-mono cd-dim">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

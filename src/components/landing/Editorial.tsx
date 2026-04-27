import { useTranslations } from "next-intl";

/**
 * Editorial blockquote section — direct port of `.editorial` from the
 * Claude Design export. Huge italic quote on the left, meta-grid on the right.
 */
export function Editorial() {
  const t = useTranslations("landing.editorial");
  return (
    <section
      className="border-t px-[var(--pad-x)] py-[100px]"
      style={{
        borderColor: "var(--line)",
        background: "var(--bg-2)",
      }}
    >
      <div className="grid items-start gap-20 md:grid-cols-[1.4fr_1fr]">
        <div className="relative">
          <div
            className="font-display absolute -left-5 top-0 italic leading-[0.5] opacity-40"
            style={{ color: "var(--cd-accent)", fontSize: 200 }}
            aria-hidden="true"
          >
            “
          </div>
          <blockquote
            className="font-display m-0 mt-[60px] mb-7 max-w-[28ch] text-pretty p-0 leading-tight"
            style={{
              fontSize: "clamp(28px, 3.4vw, 48px)",
              letterSpacing: "-0.015em",
            }}
          >
            {t("quotePart1")}{" "}
            <em>{t("quoteAccent")}</em>
          </blockquote>
          <div className="cd-mono cd-dim">— {t("attribution")}</div>
        </div>

        <dl className="flex flex-col">
          {[
            { k: "methodology", v: "SAS-SV (Kwon et al., 2013)" },
            { k: "reading", v: t("metaReading") },
            { k: "identity", v: t("metaIdentity") },
            { k: "storage", v: t("metaStorage") },
            { k: "accessibility", v: "WCAG 2.1 AA" },
            { k: "source", v: "MIT licence · open" },
          ].map((row, i, arr) => (
            <div
              key={row.k}
              className="grid grid-cols-[140px_1fr] gap-6 border-t py-[18px] text-[14px]"
              style={{
                borderTopColor: "var(--line)",
                borderBottomColor: i === arr.length - 1 ? "var(--line)" : "transparent",
                borderBottomWidth: i === arr.length - 1 ? 1 : 0,
                borderBottomStyle: "solid",
              }}
            >
              <dt className="cd-mono cd-dim">{t(`labels.${row.k}` as const)}</dt>
              <dd>{row.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

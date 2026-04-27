import { useTranslations } from "next-intl";

/**
 * Slow-scrolling fact strip between the hero and the "doors" section.
 * Direct port of the Claude Design `.marquee` element.
 */
export function Marquee() {
  const t = useTranslations("landing.marquee");
  const facts = [
    t("0"),
    t("1"),
    t("2"),
    t("3"),
    t("4"),
    t("5"),
  ];
  // Render the list twice so the loop is seamless.
  const items = [...facts, ...facts];
  return (
    <section
      aria-hidden="true"
      className="overflow-hidden border-y py-5"
      style={{
        borderColor: "var(--line)",
        background: "var(--bg-2)",
      }}
    >
      <div
        className="flex w-max gap-14 whitespace-nowrap"
        style={{ animation: "marquee 60s linear infinite" }}
      >
        {items.map((fact, i) => (
          <span
            key={i}
            className="font-display inline-flex items-center gap-3.5 italic"
            style={{
              fontSize: 22,
              color: "var(--fg-2)",
            }}
          >
            <span style={{ color: "var(--cd-accent)", fontSize: 12 }}>◐</span>
            <span>{fact}</span>
          </span>
        ))}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes marquee { to { transform: translateX(-50%); } }`,
        }}
      />
    </section>
  );
}

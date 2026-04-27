import { getTranslations } from "next-intl/server";

interface MarqueeProps {
  locale: string;
}

/**
 * Scrolling fact ribbon between hero and doors. Ports the
 * Claude Design `.marquee` pattern with linear infinite scroll.
 */
export async function Marquee({ locale }: MarqueeProps) {
  const t = await getTranslations({ locale, namespace: "landing.marquee" });
  const facts = [
    t("facts.0"),
    t("facts.1"),
    t("facts.2"),
    t("facts.3"),
    t("facts.4"),
    t("facts.5"),
  ];
  // duplicate for seamless loop
  const items = [...facts, ...facts];

  return (
    <section
      aria-hidden="true"
      className="overflow-hidden border-y py-[22px]"
      style={{
        background: "var(--bg-2)",
        borderColor: "var(--line)",
      }}
    >
      <div
        className="flex w-max gap-14 whitespace-nowrap motion-safe:animate-[marquee_60s_linear_infinite]"
      >
        {items.map((fact, i) => (
          <span
            key={i}
            className="font-display inline-flex items-baseline gap-3.5 text-[22px] italic"
            style={{ color: "var(--fg-2)" }}
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

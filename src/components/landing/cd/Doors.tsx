import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionLabel } from "./SectionLabel";
import { ArrowRight } from "lucide-react";

interface DoorProps {
  num: string;
  title: string;
  desc: string;
  cta: string;
  tag: string;
  href: string;
  accent?: boolean;
  disabled?: boolean;
  visual: "story" | "profile" | "cards";
}

/**
 * "Three ways in" section — three large entry cards that share their
 * borders (1px gap on a line-coloured background creates the dividers).
 * Middle door uses an amber-soft radial accent. Direct port of `.doors`.
 */
export function Doors() {
  const t = useTranslations("landing.doors");
  return (
    <section
      className="border-t"
      style={{
        borderColor: "var(--line)",
        padding: "100px var(--pad-x)",
      }}
    >
      <div className="mb-14">
        <SectionLabel num="01" label={t("label")} />
        <h2
          className="font-display max-w-[22ch] text-balance leading-none"
          style={{
            fontSize: "clamp(36px, 5vw, 72px)",
            letterSpacing: "-0.03em",
          }}
        >
          {t.rich("title", {
            em: (chunks) => <em>{chunks}</em>,
            br: () => <br />,
          })}
        </h2>
      </div>

      <div
        className="grid overflow-hidden rounded-[18px] border md:grid-cols-3"
        style={{
          gap: "1px",
          background: "var(--line)",
          borderColor: "var(--line)",
        }}
      >
        <Door
          num="01"
          title={t("door1.title")}
          desc={t("door1.desc")}
          cta={t("door1.cta")}
          tag={t("door1.tag")}
          href="/experience"
          disabled
          visual="story"
        />
        <Door
          num="02"
          title={t("door2.title")}
          desc={t("door2.desc")}
          cta={t("door2.cta")}
          tag={t("door2.tag")}
          href="/survey"
          accent
          visual="profile"
        />
        <Door
          num="03"
          title={t("door3.title")}
          desc={t("door3.desc")}
          cta={t("door3.cta")}
          tag={t("door3.tag")}
          href="/jeu"
          visual="cards"
        />
      </div>
    </section>
  );
}

function Door({ num, title, desc, cta, tag, href, accent, disabled, visual }: DoorProps) {
  const Inner = (
    <article
      className="group relative flex min-h-[460px] flex-col p-8 transition-colors"
      style={{
        background: accent ? "var(--bg-2)" : "var(--bg)",
      }}
    >
      {accent && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 80% -10%, var(--accent-soft), transparent 60%)",
          }}
        />
      )}
      <header className="relative mb-8 flex items-center justify-between">
        <span className="cd-mono cd-dim">{num}</span>
        <span
          className="cd-mono rounded-full border px-2.5 py-1"
          style={{
            color: accent ? "var(--cd-accent)" : "var(--fg-3)",
            borderColor: accent ? "var(--cd-accent)" : "var(--line-2)",
            background: "var(--bg-2)",
          }}
        >
          {tag}
        </span>
      </header>

      <DoorVisual kind={visual} accent={accent ?? false} />

      <h3
        className="font-display mb-3 leading-[1.05]"
        style={{
          fontSize: 32,
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </h3>
      <p
        className="flex-1 max-w-[30ch] text-base leading-normal"
        style={{ color: "var(--fg-2)" }}
      >
        {desc}
      </p>

      <span
        className="cd-mono mt-7 inline-flex w-fit items-center gap-2 border-b pb-3 pt-3 transition-all"
        style={{
          color: disabled ? "var(--fg-4)" : "var(--fg)",
          borderColor: disabled ? "var(--line)" : "var(--line-2)",
        }}
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </article>
  );

  if (disabled) {
    return <div className="cursor-not-allowed opacity-70">{Inner}</div>;
  }
  return <Link href={href}>{Inner}</Link>;
}

function DoorVisual({ kind, accent }: { kind: "story" | "profile" | "cards"; accent: boolean }) {
  const color = accent ? "var(--cd-accent)" : "var(--fg-2)";
  return (
    <div
      className="relative mb-7 h-20 overflow-hidden rounded border"
      style={{
        borderColor: "var(--line)",
        background: "var(--bg)",
        color,
      }}
    >
      <svg
        viewBox="0 0 200 80"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
      >
        {kind === "story" && (
          <>
            <line x1="20" y1="40" x2="180" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            {[40, 80, 120, 160].map((x) => (
              <circle key={x} cx={x} cy={40} r="3" fill="currentColor" opacity={x === 80 ? 1 : 0.5} />
            ))}
          </>
        )}
        {kind === "profile" && (
          <>
            <circle cx="100" cy="40" r="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <path
              d="M 78 40 A 22 22 0 0 1 122 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="100" cy="40" r="3" fill="currentColor" />
          </>
        )}
        {kind === "cards" && (
          <>
            {[60, 90, 120].map((x, i) => (
              <rect
                key={x}
                x={x}
                y={20 - i * 2}
                width="40"
                height="40"
                rx="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity={1 - i * 0.25}
                transform={`rotate(${i * 4 - 4} ${x + 20} 40)`}
              />
            ))}
          </>
        )}
      </svg>
    </div>
  );
}

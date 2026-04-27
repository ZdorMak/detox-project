import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Live community stats — three huge editorial numbers, ported from the
 * Claude Design `.stats` block. Reads aggregates from Supabase server-side;
 * falls back to zeros if the queries fail.
 */
export async function Stats() {
  const t = await getTranslations("landing.stats");

  let totalSessions = 0;
  let totalCardsDone = 0;
  let totalSurveysCompleted = 0;
  try {
    const supabase = createAdminClient();
    const [{ count: sessionsCount }, { count: cardsCount }, { count: completedCount }] =
      await Promise.all([
        supabase.from("sessions").select("id", { count: "exact", head: true }),
        supabase
          .from("challenge_attempts")
          .select("id", { count: "exact", head: true })
          .eq("outcome", "completed"),
        supabase
          .from("sessions")
          .select("id", { count: "exact", head: true })
          .not("completed_at", "is", null),
      ]);
    totalSessions = sessionsCount ?? 0;
    totalCardsDone = cardsCount ?? 0;
    totalSurveysCompleted = completedCount ?? 0;
  } catch {
    /* fall through with zeros */
  }

  const stats = [
    { n: totalSessions, label: t("items.sessions") },
    { n: totalCardsDone, label: t("items.challenges") },
    { n: totalSurveysCompleted, label: t("items.surveys") },
  ];

  return (
    <section
      className="border-t px-[var(--pad-x)] py-[100px]"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mb-14">
        <SectionLabel num="03" label={t("eyebrow")} />
      </div>
      <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label} className="border-t pt-8" style={{ borderTopColor: "var(--line-2)" }}>
            <div
              className="font-display tabular-nums leading-[0.9]"
              style={{
                fontSize: "clamp(72px, 10vw, 144px)",
                color: "var(--cd-accent)",
                letterSpacing: "-0.04em",
                textShadow: "0 0 40px var(--accent-glow)",
              }}
            >
              {s.n.toLocaleString("fr-CH")}
            </div>
            <div className="cd-mono mt-4 mb-4" style={{ color: "var(--fg-3)" }}>
              {s.label}
            </div>
            <div className="h-0.5 overflow-hidden" style={{ background: "var(--bg-2)" }}>
              <div
                className="h-full transition-[width] duration-700"
                style={{
                  width: `${Math.min((s.n / 100) * 100, 100)}%`,
                  background: "var(--cd-accent)",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div
        className="cd-mono mt-10 flex items-center gap-3 border-t pt-6"
        style={{ borderTopColor: "var(--line)", color: "var(--fg-3)" }}
      >
        <span
          className="motion-safe:animate-[pulse-dot_2.4s_ease-in-out_infinite]"
          style={{ color: "var(--good)" }}
          aria-hidden="true"
        >
          ●
        </span>
        {t("liveLabel")}
      </div>
    </section>
  );
}

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="cd-mono mb-7 flex items-center gap-3.5" style={{ color: "var(--fg-3)" }}>
      <span className="cd-dim">{num}</span>
      <span className="h-px w-20" style={{ background: "var(--line-2)" }} />
      <span>{label}</span>
    </div>
  );
}

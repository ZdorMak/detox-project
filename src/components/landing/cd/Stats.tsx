import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SectionLabel } from "./SectionLabel";

/**
 * Stats section — three giant numbers (clamp 72→144px) over a thin
 * top-divider per stat. Direct port of `.stats`.
 *
 * Numbers come from real Supabase aggregates; if the read fails we
 * render zeros instead of crashing.
 */
export async function Stats({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "landing.stats" });

  let totalSessions = 0;
  let totalCardsDone = 0;
  let totalSurveysCompleted = 0;
  try {
    const supabase = createAdminClient();
    const [a, b, c] = await Promise.all([
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
    totalSessions = a.count ?? 0;
    totalCardsDone = b.count ?? 0;
    totalSurveysCompleted = c.count ?? 0;
  } catch (err) {
    console.warn("[stats] read failed:", err);
  }

  const items = [
    { n: totalSessions, label: t("items.sessions"), max: Math.max(20, totalSessions) },
    { n: totalCardsDone, label: t("items.challenges"), max: Math.max(50, totalCardsDone) },
    { n: totalSurveysCompleted, label: t("items.surveys"), max: Math.max(10, totalSurveysCompleted) },
  ];

  return (
    <section
      className="border-t"
      style={{
        borderColor: "var(--line)",
        padding: "100px var(--pad-x)",
      }}
    >
      <div className="mb-14">
        <SectionLabel num="03" label={t("label")} />
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {items.map((s, i) => {
          const pct = Math.min(100, Math.round((s.n / s.max) * 100));
          return (
            <div
              key={i}
              className="pt-8"
              style={{ borderTop: "1px solid var(--line-2)" }}
            >
              <div
                className="font-display tabular-nums"
                style={{
                  fontSize: "clamp(72px, 10vw, 144px)",
                  lineHeight: 0.9,
                  color: "var(--cd-accent)",
                  letterSpacing: "-0.04em",
                  textShadow: "0 0 40px var(--accent-glow)",
                }}
              >
                {s.n}
              </div>
              <div
                className="mb-4 mt-4"
                style={{ color: "var(--fg-3)" }}
              >
                {s.label}
              </div>
              <div
                className="h-px overflow-hidden"
                style={{ background: "var(--bg-2)", height: 2 }}
              >
                <div
                  className="h-full transition-[width] duration-700"
                  style={{ width: `${pct}%`, background: "var(--cd-accent)" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="cd-mono cd-dim mt-10 flex items-center gap-3 border-t pt-6"
        style={{ borderColor: "var(--line)" }}
      >
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full motion-safe:animate-[pulse-dot_2.4s_ease-in-out_infinite]"
          style={{ background: "var(--good)" }}
        />
        {t("foot")}
      </div>
    </section>
  );
}

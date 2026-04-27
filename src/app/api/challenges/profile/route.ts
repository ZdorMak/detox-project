import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSession } from "@/lib/session";
import { getReadableSessionIds } from "@/lib/user-sessions";
import { getLevel } from "@/lib/challenges/levels";
import { ACHIEVEMENTS } from "@/lib/challenges/achievements";
import { PROGRAMS } from "@/lib/challenges/programs";

export const dynamic = "force-dynamic";

/**
 * GET /api/challenges/profile
 *
 * Returns everything the player profile UI needs in a single roundtrip:
 *   - level (current + progress to next)
 *   - achievements (all 12 with locked/unlocked + unlock timestamp)
 *   - programs progress (per-program: completed step count / total steps)
 *   - completed / skipped counters
 *   - oldest attempt timestamp (used by the certificate as "Member since")
 */
export async function GET() {
  try {
    const session = await getOrCreateSession();
    const supabase = createAdminClient();
    const sessionIds = await getReadableSessionIds(session.id);

    const [attemptsRes, achievementsRes, programsRes] = await Promise.all([
      supabase
        .from("challenge_attempts")
        .select("card_id, outcome, resolved_at")
        .in("session_id", sessionIds),
      supabase
        .from("achievements_unlocked")
        .select("achievement_id, unlocked_at")
        .in("session_id", sessionIds),
      supabase
        .from("program_progress")
        .select("program_id, step_index, outcome")
        .in("session_id", sessionIds),
    ]);

    const attempts = attemptsRes.data ?? [];
    const completedAttempts = attempts.filter((a) => a.outcome === "completed");
    const skippedAttempts = attempts.filter((a) => a.outcome === "skipped");

    const totalCompleted = completedAttempts.length;
    const totalSkipped = skippedAttempts.length;

    // Earliest resolved_at (or null if none).
    let memberSince: string | null = null;
    for (const a of completedAttempts) {
      if (!a.resolved_at) continue;
      if (!memberSince || a.resolved_at < memberSince) memberSince = a.resolved_at;
    }

    const level = getLevel(totalCompleted);

    const unlockedMap = new Map(
      (achievementsRes.data ?? []).map((r) => [r.achievement_id, r.unlocked_at]),
    );
    const achievements = ACHIEVEMENTS.map((a) => ({
      id: a.id,
      emoji: a.emoji,
      sortKey: a.sortKey,
      unlocked: unlockedMap.has(a.id),
      unlocked_at: unlockedMap.get(a.id) ?? null,
    })).sort(
      (a, b) =>
        Number(b.unlocked) - Number(a.unlocked) || a.sortKey - b.sortKey,
    );

    // Programs: highest step_index reached per program.
    const programStepMax = new Map<string, number>();
    for (const row of programsRes.data ?? []) {
      const cur = programStepMax.get(row.program_id) ?? -1;
      if (row.step_index > cur) programStepMax.set(row.program_id, row.step_index);
    }
    const programs = PROGRAMS.map((p) => {
      const lastIdx = programStepMax.get(p.id);
      const stepsDone = lastIdx == null ? 0 : lastIdx + 1;
      return {
        id: p.id,
        emoji: p.emoji,
        totalSteps: p.cardIds.length,
        stepsDone,
        completed: stepsDone >= p.cardIds.length,
      };
    });

    return NextResponse.json({
      level,
      totalCompleted,
      totalSkipped,
      memberSince,
      achievements,
      programs,
    });
  } catch (err) {
    console.error("[/api/challenges/profile] error:", err);
    return NextResponse.json({ error: "profile_failed" }, { status: 500 });
  }
}

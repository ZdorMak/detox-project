import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSession } from "@/lib/session";
import { getReadableSessionIds } from "@/lib/user-sessions";
import { getCard } from "@/lib/challenges/cards";
import {
  evaluateAllAchievements,
  type Attempt,
} from "@/lib/challenges/achievements";

export const dynamic = "force-dynamic";

const logBodySchema = z.object({
  cardId: z.string().min(1).max(64),
  outcome: z.enum(["completed", "skipped", "declined"]),
  rating: z.number().int().min(1).max(5).optional(),
});

/**
 * POST /api/challenges/log
 *
 * Records the outcome of a single challenge attempt, then re-evaluates all
 * achievements against the full attempt history and persists the diff to
 * `achievements_unlocked` (UNIQUE constraint = idempotent, no race conditions).
 *
 * Returns:
 *   {
 *     ok: true,
 *     unlocked: ["first_step", "five_observations"],   // new ones (may be empty)
 *   }
 */
export async function POST(req: NextRequest) {
  try {
    const json = (await req.json()) as unknown;
    const parsed = logBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { cardId, outcome, rating } = parsed.data;

    // `__program_completed__` is a sentinel posted by the ProgramRunner on
    // program completion — it has no real card but earns the program_first
    // achievement. Allow it through, otherwise validate against the deck.
    if (cardId !== "__program_completed__" && !getCard(cardId)) {
      return NextResponse.json({ error: "unknown_card_id" }, { status: 400 });
    }

    const session = await getOrCreateSession();
    const supabase = createAdminClient();

    const points = outcome === "completed" ? 10 : 0;

    const { error: insertErr } = await supabase.from("challenge_attempts").insert({
      session_id: session.id,
      card_id: cardId,
      outcome,
      rating: rating ?? null,
      resolved_at: new Date().toISOString(),
      points,
    });
    if (insertErr) {
      console.error("[/api/challenges/log] insert failed:", insertErr);
      await supabase.from("error_log").insert({
        session_id: session.id,
        error_type: "challenge_log_insert",
        message: insertErr.message,
      });
      return NextResponse.json({ error: "insert_failed" }, { status: 500 });
    }

    // Re-evaluate all achievements against the full history this viewer
    // can see (cross-device merged when signed in).
    const sessionIds = await getReadableSessionIds(session.id);
    const { data: attempts } = await supabase
      .from("challenge_attempts")
      .select("card_id, outcome, resolved_at")
      .in("session_id", sessionIds);

    const earnedIds = evaluateAllAchievements((attempts ?? []) as Attempt[]);

    // Read what was already unlocked across all the viewer's sessions.
    const { data: alreadyUnlocked } = await supabase
      .from("achievements_unlocked")
      .select("achievement_id")
      .in("session_id", sessionIds);

    const alreadySet = new Set((alreadyUnlocked ?? []).map((r) => r.achievement_id));
    const toInsert = earnedIds.filter((id) => !alreadySet.has(id));

    if (toInsert.length > 0) {
      const rows = toInsert.map((achievement_id) => ({
        session_id: session.id,
        achievement_id,
      }));
      const { error: achErr } = await supabase
        .from("achievements_unlocked")
        .insert(rows);
      if (achErr) {
        // Non-fatal: the attempt itself is logged. Just record the error.
        console.error("[/api/challenges/log] achievement insert failed:", achErr);
        await supabase.from("error_log").insert({
          session_id: session.id,
          error_type: "achievement_insert",
          message: achErr.message,
        });
      }
    }

    return NextResponse.json({ ok: true, unlocked: toInsert });
  } catch (err) {
    console.error("[/api/challenges/log] error:", err);
    return NextResponse.json({ error: "log_failed" }, { status: 500 });
  }
}

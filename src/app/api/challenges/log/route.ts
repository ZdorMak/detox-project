import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSession } from "@/lib/session";
import { getCard } from "@/lib/challenges/cards";

export const dynamic = "force-dynamic";

const logBodySchema = z.object({
  cardId: z.string().min(1).max(64),
  outcome: z.enum(["completed", "skipped", "declined"]),
  rating: z.number().int().min(1).max(5).optional(),
});

/**
 * POST /api/challenges/log
 *
 * Records the outcome of a single challenge attempt. The body must reference
 * a known card id (we validate against the deck at the edge — invalid ids are
 * rejected so the analytics stay clean).
 *
 * Returns the updated session-level counters so the client can refresh its
 * progress UI without a second roundtrip.
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

    if (!getCard(cardId)) {
      return NextResponse.json({ error: "unknown_card_id" }, { status: 400 });
    }

    const session = await getOrCreateSession();
    const supabase = createAdminClient();

    const { error: insertErr } = await supabase.from("challenge_attempts").insert({
      session_id: session.id,
      card_id: cardId,
      outcome,
      rating: rating ?? null,
      resolved_at: new Date().toISOString(),
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/challenges/log] error:", err);
    return NextResponse.json({ error: "log_failed" }, { status: 500 });
  }
}

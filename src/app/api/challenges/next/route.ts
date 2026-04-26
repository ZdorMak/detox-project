import { NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { getChallengeStats, pickNextCard } from "@/lib/challenges/state";

export const dynamic = "force-dynamic";

/**
 * GET /api/challenges/next
 *
 * Returns the next card to show — preferring unseen cards, easier first.
 * Used by the client after each attempt is logged.
 */
export async function GET() {
  try {
    const session = await getOrCreateSession();
    const stats = await getChallengeStats(session.id);
    const card = pickNextCard(stats);
    return NextResponse.json({ card });
  } catch (err) {
    console.error("[/api/challenges/next] error:", err);
    return NextResponse.json({ error: "next_failed" }, { status: 500 });
  }
}

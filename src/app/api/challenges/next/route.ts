import { NextResponse, type NextRequest } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import {
  getChallengeStats,
  parseLocation,
  pickNextCard,
} from "@/lib/challenges/state";

export const dynamic = "force-dynamic";

/**
 * GET /api/challenges/next?location=home|school|transport|outside|with_friends
 *
 * Returns the next card to show — preferring unseen cards, easier first.
 * Filters by the player's current location so we never suggest "Sors marcher"
 * while they're sitting in class.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getOrCreateSession();
    const stats = await getChallengeStats(session.id);
    const location = parseLocation(req.nextUrl.searchParams.get("location"));
    const card = pickNextCard(stats, location);
    return NextResponse.json({ card, location });
  } catch (err) {
    console.error("[/api/challenges/next] error:", err);
    return NextResponse.json({ error: "next_failed" }, { status: 500 });
  }
}

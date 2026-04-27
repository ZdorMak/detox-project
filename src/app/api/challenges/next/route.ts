import { NextResponse, type NextRequest } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import {
  getChallengeStats,
  parseLocation,
  pickNextCard,
} from "@/lib/challenges/state";
import { timeOfDayFromHour } from "@/lib/challenges/cards";

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
    // Client passes its local hour so server can pick time-appropriate cards.
    // Falls back to UTC if missing (acceptable degradation).
    const hourParam = req.nextUrl.searchParams.get("hour");
    const hour = hourParam !== null && /^\d+$/.test(hourParam)
      ? Number(hourParam)
      : new Date().getUTCHours();
    const timeOfDay = timeOfDayFromHour(hour);
    const card = pickNextCard(stats, location, timeOfDay);
    return NextResponse.json({ card, location, timeOfDay });
  } catch (err) {
    console.error("[/api/challenges/next] error:", err);
    return NextResponse.json({ error: "next_failed" }, { status: 500 });
  }
}

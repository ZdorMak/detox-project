import { createAdminClient } from "@/lib/supabase/admin";
import { getReadableSessionIds } from "@/lib/user-sessions";
import {
  CHALLENGE_CARDS,
  cardsForLocation,
  type ChallengeCard,
  type Location,
  type TimeOfDay,
} from "./cards";

export type Outcome = "completed" | "skipped" | "declined";

export interface AttemptRow {
  card_id: string;
  outcome: Outcome;
  drawn_at: string;
}

export interface ChallengeStats {
  totalCompleted: number;
  totalSkipped: number;
  totalDeclined: number;
  /** Cards the player has *completed* at least once. */
  completedIds: Set<string>;
  /** Cards already drawn (any outcome) at least once. */
  drawnIds: Set<string>;
}

/**
 * Reads all challenge_attempts for the current session and aggregates them
 * into a small set of counters + the set of card ids already seen — used by
 * the deck draw to avoid showing the same card twice in a session.
 */
export async function getChallengeStats(sessionId: string): Promise<ChallengeStats> {
  const supabase = createAdminClient();
  // Aggregate across every session this viewer can read (anon → just one;
  // signed-in → all their sessions across devices).
  const sessionIds = await getReadableSessionIds(sessionId);
  const { data, error } = await supabase
    .from("challenge_attempts")
    .select("card_id, outcome")
    .in("session_id", sessionIds);

  if (error) {
    console.error("[challenges/state] read failed:", error);
    throw new Error("challenge_stats_read_failed");
  }

  const stats: ChallengeStats = {
    totalCompleted: 0,
    totalSkipped: 0,
    totalDeclined: 0,
    completedIds: new Set(),
    drawnIds: new Set(),
  };
  for (const row of data ?? []) {
    stats.drawnIds.add(row.card_id);
    if (row.outcome === "completed") {
      stats.totalCompleted++;
      stats.completedIds.add(row.card_id);
    } else if (row.outcome === "skipped") {
      stats.totalSkipped++;
    } else if (row.outcome === "declined") {
      stats.totalDeclined++;
    }
  }
  return stats;
}

/**
 * Pick the next card to show. Strategy:
 *  1. Filter to the player's current location.
 *  2. Prefer cards the player hasn't drawn yet (any outcome).
 *  3. Among unseen, prefer easier cards first (difficulty 1 → 2 → 3) — the
 *     deck "warms up" the player before tougher real-world asks.
 *  4. Within a difficulty band, pick a random card so two players don't see
 *     identical sequences.
 *  5. If everything available at this location is drawn, recycle from the
 *     same location pool uniformly.
 */
export function pickNextCard(
  stats: ChallengeStats,
  location: Location,
  timeOfDay?: TimeOfDay,
): ChallengeCard | null {
  // 1) Start from cards available at this location.
  let atLocation = cardsForLocation(location);

  // 2) Apply time-of-day filter (no late-night squats, etc.).
  if (timeOfDay) {
    const filtered = atLocation.filter(
      (c) => !c.excludedTimes?.includes(timeOfDay),
    );
    if (filtered.length > 0) atLocation = filtered;
  }

  // 3) HARD exclusion: cards already completed never come back.
  //    The whole point of the deck is breadth, not grinding.
  const notCompleted = atLocation.filter((c) => !stats.completedIds.has(c.id));
  if (notCompleted.length === 0) {
    // Player has done every available card here at this time. Signal
    // "deck exhausted" — the UI shows the done state.
    return null;
  }

  // 4) Of the remaining: prefer cards never drawn yet (any outcome).
  //    If everything has been drawn but skipped/declined, recycle from
  //    the not-completed set so the player can try them again.
  const unseen = notCompleted.filter((c) => !stats.drawnIds.has(c.id));
  const pool = unseen.length > 0 ? unseen : notCompleted;

  // 5) Within the pool, prefer easier difficulty first; random within band.
  const minDifficulty = Math.min(...pool.map((c) => c.difficulty));
  const band = pool.filter((c) => c.difficulty === minDifficulty);
  const idx = Math.floor(Math.random() * band.length);
  return band[idx] ?? null;
}

/** Whether `id` is a known location string — used to validate query params. */
const VALID_LOCATIONS = new Set<string>([
  "home",
  "school",
  "transport",
  "outside",
  "with_friends",
]);
export function parseLocation(raw: string | null | undefined): Location {
  if (raw && VALID_LOCATIONS.has(raw)) return raw as Location;
  return "home";
}

/** Convenience for listing how many cards exist at a given location, by category. */
export function locationStats(location: Location): Record<string, number> {
  const out: Record<string, number> = {};
  for (const card of cardsForLocation(location)) {
    out[card.category] = (out[card.category] ?? 0) + 1;
  }
  out.total = cardsForLocation(location).length;
  return out;
}

// Re-export for callers that import everything from one place.
export { CHALLENGE_CARDS };

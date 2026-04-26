import { createAdminClient } from "@/lib/supabase/admin";
import { CHALLENGE_CARDS, type ChallengeCard } from "./cards";

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
  const { data, error } = await supabase
    .from("challenge_attempts")
    .select("card_id, outcome")
    .eq("session_id", sessionId);

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
 *  1. Prefer cards the player hasn't drawn yet (any outcome).
 *  2. Among unseen, prefer easier cards first (difficulty 1 → 2 → 3) — the
 *     deck "warms up" the player before tougher real-world asks.
 *  3. Within a difficulty band, pick a random card so two players don't see
 *     identical sequences.
 *  4. If everything is drawn, recycle from completed/skipped uniformly.
 *
 * Returns null only if the deck is empty (never in practice — there are 30 cards).
 */
export function pickNextCard(stats: ChallengeStats): ChallengeCard | null {
  const unseen = CHALLENGE_CARDS.filter((c) => !stats.drawnIds.has(c.id));
  const pool = unseen.length > 0 ? unseen : [...CHALLENGE_CARDS];
  if (pool.length === 0) return null;

  // Sort by difficulty ascending, then take all cards in the lowest band present.
  const minDifficulty = Math.min(...pool.map((c) => c.difficulty));
  const band = pool.filter((c) => c.difficulty === minDifficulty);
  const idx = Math.floor(Math.random() * band.length);
  return band[idx] ?? null;
}

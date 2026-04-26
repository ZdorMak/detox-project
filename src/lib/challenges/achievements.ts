/**
 * Achievements — 12 unlockable badges.
 *
 * Each achievement is defined declaratively by an `evaluate` function that
 * receives the full attempt history and returns true/false. Run on every
 * `/api/challenges/log` insert; new unlocks are persisted to
 * `achievements_unlocked` (UNIQUE constraint = idempotent).
 */

import type { ChallengeCategory } from "./cards";
import { getCard } from "./cards";

export interface Attempt {
  card_id: string;
  outcome: "completed" | "skipped" | "declined";
  resolved_at: string | null;
}

export interface AchievementDef {
  id: string;
  emoji: string;
  /** Sorted display order — earned ones bubble up. */
  sortKey: number;
  evaluate: (attempts: Attempt[]) => boolean;
}

function completedAttempts(attempts: Attempt[]): Attempt[] {
  return attempts.filter((a) => a.outcome === "completed");
}

function countCategory(attempts: Attempt[], cat: ChallengeCategory): number {
  let n = 0;
  for (const a of completedAttempts(attempts)) {
    const card = getCard(a.card_id);
    if (card?.category === cat) n++;
  }
  return n;
}

function hasCardCompleted(attempts: Attempt[], cardId: string): boolean {
  return attempts.some((a) => a.outcome === "completed" && a.card_id === cardId);
}

/** Returns the count of completed attempts on the highest-volume calendar day. */
function maxCompletedInOneDay(attempts: Attempt[]): number {
  const buckets = new Map<string, number>();
  for (const a of completedAttempts(attempts)) {
    const day = (a.resolved_at ?? "").slice(0, 10); // YYYY-MM-DD
    if (!day) continue;
    buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  let max = 0;
  for (const v of buckets.values()) if (v > max) max = v;
  return max;
}

/** Hour-of-day check on any completed attempt. */
function completedInHourRange(attempts: Attempt[], fromHourInclusive: number, toHourExclusive: number): boolean {
  // Range may wrap midnight (e.g. 22..2 means 22:00-23:59 OR 00:00-01:59).
  const wraps = fromHourInclusive >= toHourExclusive;
  for (const a of completedAttempts(attempts)) {
    if (!a.resolved_at) continue;
    const h = new Date(a.resolved_at).getHours();
    const inRange = wraps
      ? h >= fromHourInclusive || h < toHourExclusive
      : h >= fromHourInclusive && h < toHourExclusive;
    if (inRange) return true;
  }
  return false;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: "first_step",
    emoji: "🌱",
    sortKey: 10,
    evaluate: (a) => completedAttempts(a).length >= 1,
  },
  {
    id: "five_observations",
    emoji: "🔍",
    sortKey: 20,
    evaluate: (a) => countCategory(a, "observation") >= 5,
  },
  {
    id: "five_socials",
    emoji: "🤝",
    sortKey: 21,
    evaluate: (a) => countCategory(a, "social") >= 5,
  },
  {
    id: "five_movements",
    emoji: "🏃",
    sortKey: 22,
    evaluate: (a) => countCategory(a, "movement") >= 5,
  },
  {
    id: "five_creatives",
    emoji: "🎨",
    sortKey: 23,
    evaluate: (a) => countCategory(a, "creative") >= 5,
  },
  {
    id: "five_reflections",
    emoji: "🧘",
    sortKey: 24,
    evaluate: (a) => countCategory(a, "reflection") >= 5,
  },
  {
    id: "full_circle",
    emoji: "🌈",
    sortKey: 30,
    evaluate: (a) =>
      countCategory(a, "observation") >= 1 &&
      countCategory(a, "social") >= 1 &&
      countCategory(a, "movement") >= 1 &&
      countCategory(a, "creative") >= 1 &&
      countCategory(a, "reflection") >= 1,
  },
  {
    id: "marathon",
    emoji: "🏆",
    sortKey: 40,
    evaluate: (a) => maxCompletedInOneDay(a) >= 10,
  },
  {
    id: "meal_phone_free",
    emoji: "🍽️",
    sortKey: 50,
    evaluate: (a) => hasCardCompleted(a, "share_meal_no_phone"),
  },
  {
    id: "night_owl",
    emoji: "🌙",
    sortKey: 60,
    evaluate: (a) => completedInHourRange(a, 22, 2), // 22:00 → 01:59
  },
  {
    id: "early_bird",
    emoji: "🌅",
    sortKey: 61,
    evaluate: (a) => completedInHourRange(a, 5, 7), // 05:00 → 06:59
  },
  {
    id: "program_first",
    emoji: "🥇",
    sortKey: 70,
    // Wired by the program runner — looking at attempts isn't enough since
    // a program "completion" is recorded in program_progress, not here.
    // We pass a synthetic attempt with card_id="__program_completed__" when
    // a program finishes; that triggers this rule. See programs.ts.
    evaluate: (a) =>
      a.some((x) => x.card_id === "__program_completed__" && x.outcome === "completed"),
  },
] as const;

const ACH_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
export function getAchievement(id: string): AchievementDef | undefined {
  return ACH_BY_ID.get(id);
}

/**
 * Returns the ids of achievements unlocked given the full attempt history.
 * Pure function — does NOT consult the DB. The caller compares this set
 * against `achievements_unlocked` rows and inserts the diff.
 */
export function evaluateAllAchievements(attempts: Attempt[]): string[] {
  const out: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (ach.evaluate(attempts)) out.push(ach.id);
  }
  return out;
}

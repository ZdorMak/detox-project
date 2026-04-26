/**
 * Player levels — derived purely from `totalCompleted` count.
 *
 * Thresholds chosen for a school-year cadence: most students will hit
 * Niveau 2 within a week of casual play, Niveau 3 within a month.
 * Niveau 5 (Maître) is intentionally a stretch — recognises sustained
 * engagement, not novelty.
 */

export interface LevelDef {
  /** 1..5 — drives ordering and the "next level" calculation. */
  num: 1 | 2 | 3 | 4 | 5;
  /** i18n key under `challenges.levels.<id>.label` and `.subtitle`. */
  id: "debutant" | "curieux" | "engage" | "habitue" | "maitre";
  /** Inclusive lower bound on totalCompleted. */
  min: number;
}

export const LEVELS: readonly LevelDef[] = [
  { num: 1, id: "debutant", min: 0 },
  { num: 2, id: "curieux",  min: 5 },
  { num: 3, id: "engage",   min: 15 },
  { num: 4, id: "habitue",  min: 30 },
  { num: 5, id: "maitre",   min: 50 },
] as const;

export interface LevelProgress {
  current: LevelDef;
  /** Total completed cards. */
  totalCompleted: number;
  /** Progress within the current level, 0..100. 100 if at top level. */
  pct: number;
  /** How many cards still needed to hit the next level. null if at top. */
  toNext: number | null;
  /** The next level definition (null if at top). */
  next: LevelDef | null;
}

export function getLevel(totalCompleted: number): LevelProgress {
  // LEVELS is sorted; pick the highest one whose min ≤ totalCompleted.
  let current = LEVELS[0]!;
  for (const lvl of LEVELS) {
    if (totalCompleted >= lvl.min) current = lvl;
  }
  const idx = LEVELS.findIndex((l) => l.id === current.id);
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1]! : null;

  if (!next) {
    return { current, totalCompleted, pct: 100, toNext: null, next: null };
  }
  const span = next.min - current.min;
  const within = totalCompleted - current.min;
  const pct = Math.min(100, Math.max(0, Math.round((within / span) * 100)));
  return { current, totalCompleted, pct, toNext: next.min - totalCompleted, next };
}

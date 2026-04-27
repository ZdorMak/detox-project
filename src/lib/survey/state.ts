/**
 * Server-side helpers for the SAS-SV survey flow.
 *
 * Centralises the "what should this anonymous user see next?" logic so the
 * /survey page (W2-2), /results page (W2-4) and resume hand-off (W2-6) all
 * agree.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { getReadableSessionIds } from "@/lib/user-sessions";
import { SAS_SV_ITEMS, computeScore, riskBand, symptomBreakdown, type RiskBand, type SasSymptom } from "./sas-sv";

export type SurveyAnswers = Record<number, number>;

export interface SurveyState {
  /** Numeric Likert value indexed by SAS-SV item id (1..10). Missing = unanswered. */
  answers: SurveyAnswers;
  /** Number of items answered with a valid 1-6 value. */
  answeredCount: number;
  /** True iff every SAS-SV item has a valid answer. */
  isComplete: boolean;
  /** 1-indexed id of the next unanswered item, or null if complete. */
  nextItemId: number | null;
}

export interface SurveyResult {
  totalScore: number;
  band: RiskBand;
  bySymptom: Record<SasSymptom, number>;
}

/**
 * Read all answers a session has submitted so far and derive the resume state.
 * Uses the generated `value_numeric` column (see migration 002) to avoid
 * parsing JSONB on every load.
 */
export async function getSurveyState(sessionId: string): Promise<SurveyState> {
  const supabase = createAdminClient();
  // Cross-device merge: signed-in viewer sees the union of all their sessions.
  const sessionIds = await getReadableSessionIds(sessionId);
  const { data, error } = await supabase
    .from("survey_responses")
    .select("question_id, value_numeric")
    .in("session_id", sessionIds);

  if (error) {
    console.error("[survey/state] read failed:", error);
    throw new Error("survey_state_read_failed");
  }

  const answers: SurveyAnswers = {};
  for (const row of data ?? []) {
    const itemId = parseSasItemId(row.question_id);
    const value = row.value_numeric;
    if (itemId != null && typeof value === "number" && value >= 1 && value <= 6) {
      answers[itemId] = value;
    }
  }

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === SAS_SV_ITEMS.length;
  const nextItemId = isComplete
    ? null
    : (SAS_SV_ITEMS.find((it) => answers[it.id] === undefined)?.id ?? null);

  return { answers, answeredCount, isComplete, nextItemId };
}

/**
 * Compute the SAS-SV result for a completed session.
 * Throws if the survey is not yet complete — caller must check `isComplete`.
 */
export function deriveResult(answers: SurveyAnswers): SurveyResult {
  const totalScore = computeScore(answers);
  return {
    totalScore,
    band: riskBand(totalScore),
    bySymptom: symptomBreakdown(answers),
  };
}

/**
 * Mark the session as completed (sets `completed_at` if not already set).
 * Idempotent.
 */
export async function markSessionCompleted(sessionId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .is("completed_at", null);
  if (error) {
    console.error("[survey/state] mark complete failed:", error);
    // Non-fatal: results can still render. Don't throw.
  }
}

/** Question IDs in the DB are stored as `sas_sv_<n>` (e.g. `sas_sv_3`). */
export function sasQuestionId(itemId: number): string {
  return `sas_sv_${itemId}`;
}

function parseSasItemId(questionId: string): number | null {
  const match = /^sas_sv_(\d{1,2})$/.exec(questionId);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isInteger(n) && n >= 1 && n <= SAS_SV_ITEMS.length ? n : null;
}

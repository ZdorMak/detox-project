import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSession } from "@/lib/session";
import { SAS_SV_ITEMS } from "@/lib/survey/sas-sv";
import { getSurveyState, markSessionCompleted, sasQuestionId } from "@/lib/survey/state";

export const dynamic = "force-dynamic";

const answerBodySchema = z.object({
  itemId: z.number().int().min(1).max(SAS_SV_ITEMS.length),
  value: z.number().int().min(1).max(6),
});

/**
 * POST /api/survey/answer
 *
 * Idempotent on (session_id, question_id) thanks to the unique constraint
 * added in migration 002. Re-answering the same item updates the value
 * rather than inserting a duplicate.
 *
 * Body: { itemId: 1..10, value: 1..6 }
 * Response: 200 { ok: true, answeredCount, isComplete, nextItemId }
 *           400 invalid_body
 *           500 insert_failed
 */
export async function POST(req: NextRequest) {
  try {
    const json = (await req.json()) as unknown;
    const parsed = answerBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { itemId, value } = parsed.data;

    const session = await getOrCreateSession();
    const supabase = createAdminClient();

    const { error } = await supabase.from("survey_responses").upsert(
      {
        session_id: session.id,
        question_id: sasQuestionId(itemId),
        answer: { value, instrument: "sas_sv", item_id: itemId },
      },
      { onConflict: "session_id,question_id" },
    );

    if (error) {
      console.error("[/api/survey/answer] upsert failed:", error);
      await supabase.from("error_log").insert({
        session_id: session.id,
        error_type: "survey_upsert",
        message: error.message,
      });
      return NextResponse.json({ error: "insert_failed" }, { status: 500 });
    }

    const state = await getSurveyState(session.id);
    if (state.isComplete) {
      await markSessionCompleted(session.id);
    }

    return NextResponse.json({
      ok: true,
      answeredCount: state.answeredCount,
      isComplete: state.isComplete,
      nextItemId: state.nextItemId,
    });
  } catch (err) {
    console.error("[/api/survey/answer] error:", err);
    return NextResponse.json({ error: "answer_failed" }, { status: 500 });
  }
}

/**
 * GET /api/survey/answer
 *
 * Returns the resume state for the current session — used by the client
 * to know which question to show first.
 */
export async function GET() {
  try {
    const session = await getOrCreateSession();
    const state = await getSurveyState(session.id);
    return NextResponse.json({
      sessionId: session.id,
      answers: state.answers,
      answeredCount: state.answeredCount,
      isComplete: state.isComplete,
      nextItemId: state.nextItemId,
    });
  } catch (err) {
    console.error("[/api/survey/answer GET] error:", err);
    return NextResponse.json({ error: "state_failed" }, { status: 500 });
  }
}

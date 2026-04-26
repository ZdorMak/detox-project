import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSession } from "@/lib/session";
import { getProgram } from "@/lib/challenges/programs";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  programId: z.string().min(1).max(64),
  stepIndex: z.number().int().min(0).max(99),
  cardId: z.string().min(1).max(64),
  outcome: z.enum(["completed", "skipped", "declined"]),
});

/**
 * POST /api/challenges/program-step
 *
 * Records progress through a program. Idempotent on
 * (session_id, program_id, step_index) — re-posting updates the row.
 */
export async function POST(req: NextRequest) {
  try {
    const json = (await req.json()) as unknown;
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { programId, stepIndex, cardId, outcome } = parsed.data;

    const program = getProgram(programId);
    if (!program) {
      return NextResponse.json({ error: "unknown_program" }, { status: 400 });
    }
    if (stepIndex >= program.cardIds.length) {
      return NextResponse.json({ error: "step_out_of_range" }, { status: 400 });
    }
    if (program.cardIds[stepIndex] !== cardId) {
      return NextResponse.json({ error: "card_does_not_match_step" }, { status: 400 });
    }

    const session = await getOrCreateSession();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("program_progress")
      .upsert(
        {
          session_id: session.id,
          program_id: programId,
          step_index: stepIndex,
          card_id: cardId,
          outcome,
        },
        { onConflict: "session_id,program_id,step_index" },
      );

    if (error) {
      console.error("[/api/challenges/program-step] upsert failed:", error);
      await supabase.from("error_log").insert({
        session_id: session.id,
        error_type: "program_step_upsert",
        message: error.message,
      });
      return NextResponse.json({ error: "insert_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/challenges/program-step] error:", err);
    return NextResponse.json({ error: "step_failed" }, { status: 500 });
  }
}

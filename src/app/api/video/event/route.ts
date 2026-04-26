import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSession } from "@/lib/session";
import type { Json } from "@/types/supabase";

export const dynamic = "force-dynamic";

/**
 * Allowed event_type values. Anything outside this list is rejected at the
 * edge so we never end up with mystery strings in the analytics.
 */
const VIDEO_EVENT_TYPES = [
  "video_start",
  "video_play",
  "video_pause",
  "video_seek",
  "video_complete",
  "video_error",
  "branch_choice",
  "subtitle_toggle",
  "fullscreen_toggle",
] as const;

const eventSchema = z.object({
  event_type: z.enum(VIDEO_EVENT_TYPES),
  timestamp_ms: z.number().int().nonnegative(),
  video_position_s: z.number().nonnegative().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const bodySchema = z.union([
  eventSchema,
  z.array(eventSchema).min(1).max(50),
]);

/**
 * POST /api/video/event
 *
 * Accepts either a single event object or an array of up to 50 events
 * (batched to keep request rate down on slow networks).
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

    const session = await getOrCreateSession();
    const supabase = createAdminClient();

    const events = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    const rows = events.map((e) => ({
      session_id: session.id,
      event_type: e.event_type,
      timestamp_ms: e.timestamp_ms,
      video_position_s: e.video_position_s ?? null,
      // zod validates `metadata` as a record of unknown — Supabase wants the
      // recursive `Json` type. zod's runtime guarantees the shape is JSON-safe.
      metadata: (e.metadata ?? null) as Json,
    }));

    const { error } = await supabase.from("video_events").insert(rows);
    if (error) {
      console.error("[/api/video/event] insert failed:", error);
      await supabase.from("error_log").insert({
        session_id: session.id,
        error_type: "video_event_insert",
        message: error.message,
      });
      return NextResponse.json({ error: "insert_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (err) {
    console.error("[/api/video/event] error:", err);
    return NextResponse.json({ error: "event_failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * POST /api/session
 *
 * Idempotent: returns the existing anonymous session for this browser
 * (via httpOnly cookie) or creates a new one.
 */
export async function POST() {
  try {
    const session = await getOrCreateSession();
    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("[/api/session] error:", err);
    return NextResponse.json(
      { error: "session_failed" },
      { status: 500 },
    );
  }
}

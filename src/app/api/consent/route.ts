import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSession } from "@/lib/session";
import { sha256Hex } from "@/lib/utils";

export const dynamic = "force-dynamic";

const consentBodySchema = z.object({
  consent_type: z.enum(["analytics", "research"]),
  granted: z.boolean(),
});

/**
 * POST /api/consent
 *
 * Records a GDPR consent decision against the current anonymous session.
 * Hashes the IP (never stores raw) for audit purposes.
 */
export async function POST(req: NextRequest) {
  try {
    const json = (await req.json()) as unknown;
    const parsed = consentBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const session = await getOrCreateSession();
    const supabase = createAdminClient();

    // Best-effort IP hashing — strip port if present.
    const ipRaw =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "";
    const ipHash = ipRaw ? await sha256Hex(ipRaw) : null;

    const { error } = await supabase.from("consent_log").insert({
      session_id: session.id,
      consent_type: parsed.data.consent_type,
      granted: parsed.data.granted,
      ip_hash: ipHash,
    });

    if (error) {
      console.error("[/api/consent] insert failed:", error);
      return NextResponse.json({ error: "insert_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/consent] error:", err);
    return NextResponse.json({ error: "consent_failed" }, { status: 500 });
  }
}

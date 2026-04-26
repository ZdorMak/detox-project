import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { ANON_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * GET /auth/callback?code=...&next=/jeu
 *
 * Handles the OAuth code exchange + magic-link token verification, then
 * "claims" the current anonymous session for the freshly-signed-in user:
 *   - upserts a `players` row (id = auth.users.id)
 *   - if sessions.user_id is NULL for the cookie's anonymous_id, sets it
 * Finally redirects to `next` (validated to be same-origin).
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorParam)}`, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=missing_code`, req.url));
  }

  const supabase = await createClient();
  const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeErr || !exchangeData.session) {
    console.error("[/auth/callback] code exchange failed:", exchangeErr);
    return NextResponse.redirect(new URL(`/login?error=exchange_failed`, req.url));
  }

  const user = exchangeData.session.user;
  if (!user.email) {
    return NextResponse.redirect(new URL(`/login?error=missing_email`, req.url));
  }

  const admin = createAdminClient();

  // 1) Upsert the player row.
  const { error: playerErr } = await admin.from("players").upsert(
    {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    },
    { onConflict: "id" },
  );
  if (playerErr) {
    console.error("[/auth/callback] player upsert failed:", playerErr);
    // Non-fatal — auth succeeded. Log and continue.
  }

  // 2) Claim the current anonymous session for this user (if not already claimed).
  const cookieStore = await cookies();
  const anonId = cookieStore.get(ANON_COOKIE)?.value;
  if (anonId) {
    const { data: sess } = await admin
      .from("sessions")
      .select("id, user_id")
      .eq("anonymous_id", anonId)
      .maybeSingle();
    if (sess && sess.user_id == null) {
      const { error: linkErr } = await admin
        .from("sessions")
        .update({ user_id: user.id })
        .eq("id", sess.id);
      if (linkErr) {
        console.error("[/auth/callback] session claim failed:", linkErr);
      }
    }
  }

  return NextResponse.redirect(new URL(next, req.url));
}

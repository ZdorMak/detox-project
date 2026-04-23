import { cookies, headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sha256Hex } from "@/lib/utils";

/**
 * Cookie name carrying the opaque anonymous_id. httpOnly so client JS can't tamper.
 * The cookie itself is minted in `src/middleware.ts` at the edge — Server
 * Components cannot modify cookies during streaming render, so middleware is
 * the only safe write path for the cookie itself. This module only reads it.
 */
export const ANON_COOKIE = "detox_anon_id";

export type SessionRow = {
  id: string;
  anonymous_id: string;
};

/**
 * Read or create the anonymous session for the current request.
 * - Cookie is assumed to be already set by middleware.
 * - If a row exists for that anon id, return it.
 * - Otherwise insert a fresh row keyed to the cookie value.
 *
 * Server-side only; uses the service-role client.
 */
export async function getOrCreateSession(): Promise<SessionRow> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const anonId = cookieStore.get(ANON_COOKIE)?.value;
  if (!anonId) {
    // Should not happen — middleware mints the cookie. If it does, fail loudly
    // so we notice in error_log rather than silently creating duplicate rows.
    throw new Error("anon_cookie_missing — middleware did not run");
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("sessions")
    .select("id, anonymous_id")
    .eq("anonymous_id", anonId)
    .maybeSingle();
  if (existing) return existing;

  const ua = headerStore.get("user-agent") ?? "";
  const uaHash = ua ? await sha256Hex(ua) : null;

  const { data, error } = await supabase
    .from("sessions")
    .insert({ anonymous_id: anonId, user_agent_hash: uaHash })
    .select("id, anonymous_id")
    .single();
  if (error || !data) {
    throw new Error(`Failed to create session: ${error?.message ?? "unknown"}`);
  }
  return data;
}

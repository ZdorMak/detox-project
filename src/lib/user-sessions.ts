import { cookies } from "next/headers";
import { createClient as createSsrClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ANON_COOKIE } from "@/lib/session";

/**
 * Returns the set of session ids whose data should be visible to the
 * **current viewer**.
 *
 * - Anonymous viewer: their single cookie-bound session id only.
 * - Signed-in viewer: every session row where `user_id = auth.uid()` —
 *   merges the same player's progress across phone, school laptop, etc.
 *
 * Used by all read-side queries (profile, certificate, programs, results)
 * so that signing in transparently surfaces every device's history.
 *
 * Writes still attribute to the *current* session id — we never silently
 * mutate other sessions. Aggregation is read-only.
 */
export async function getReadableSessionIds(currentSessionId: string): Promise<string[]> {
  const supabase = await createSsrClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anonymous viewer — only their cookie-bound session.
  if (!user) return [currentSessionId];

  // Signed-in viewer — union of (current session) ∪ (all sessions for this user).
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("sessions")
    .select("id")
    .eq("user_id", user.id);
  if (error) {
    console.error("[user-sessions] read failed:", error);
    return [currentSessionId];
  }
  const ids = new Set<string>([currentSessionId]);
  for (const row of data ?? []) ids.add(row.id);
  return [...ids];
}

/** Convenience: read the cookie value (debugging only). */
export async function readAnonCookie(): Promise<string | null> {
  const c = await cookies();
  return c.get(ANON_COOKIE)?.value ?? null;
}

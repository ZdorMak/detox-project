import { cookies, headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sha256Hex } from "@/lib/utils";

/**
 * Cookie name carrying the opaque anonymous_id. httpOnly so client JS can't tamper.
 */
export const ANON_COOKIE = "detox_anon_id";

/** 1 year in seconds — anon session is long-lived. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type SessionRow = {
  id: string;
  anonymous_id: string;
};

/**
 * Read or create the anonymous session for the current request.
 * - If the cookie is present and a row exists, return it.
 * - Otherwise insert a fresh row and set the cookie.
 *
 * Server-side only; uses the service-role client.
 */
export async function getOrCreateSession(): Promise<SessionRow> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const existingId = cookieStore.get(ANON_COOKIE)?.value;
  const supabase = createAdminClient();

  if (existingId) {
    const { data: existing } = await supabase
      .from("sessions")
      .select("id, anonymous_id")
      .eq("anonymous_id", existingId)
      .maybeSingle();
    if (existing) return existing;
  }

  // Either no cookie or row was deleted — mint a new one.
  const newAnon = crypto.randomUUID();
  const ua = headerStore.get("user-agent") ?? "";
  const uaHash = ua ? await sha256Hex(ua) : null;

  const { data, error } = await supabase
    .from("sessions")
    .insert({ anonymous_id: newAnon, user_agent_hash: uaHash })
    .select("id, anonymous_id")
    .single();
  if (error || !data) {
    throw new Error(`Failed to create session: ${error?.message ?? "unknown"}`);
  }

  cookieStore.set(ANON_COOKIE, newAnon, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return data;
}

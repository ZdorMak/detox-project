import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

type CookieTuple = { name: string; value: string; options: CookieOptions };

/**
 * Supabase client for Server Components / Route Handlers / Server Actions.
 * Uses the anon/publishable key — RLS still applies.
 *
 * Use {@link createAdminClient} for trusted server-side writes that need to
 * bypass RLS (anonymous session inserts, consent_log writes, etc.).
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env",
    );
  }
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieTuple[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component — safe to ignore
          // when middleware refreshes sessions.
        }
      },
    },
  });
}

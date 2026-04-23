import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * Refresh Supabase auth session on every request that hits the middleware.
 * Cookies set by Supabase are copied onto the provided downstream response
 * (typically the next-intl response) so both systems coexist cleanly.
 */
export async function updateSession(
  request: NextRequest,
  downstream: NextResponse,
): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Don't break the request if env is missing during local boot — log loudly instead.
    console.warn("[supabase/middleware] Missing env vars — skipping session refresh.");
    return downstream;
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          downstream.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touching getUser() forces the session refresh + cookie write.
  await supabase.auth.getUser();
  return downstream;
}

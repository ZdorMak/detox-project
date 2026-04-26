import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /auth/signout
 *
 * Clears the Supabase auth session cookies. Does NOT touch the
 * `detox_anon_id` cookie — anonymous play continues with the same
 * progress after signout.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL("/", req.url);
  return NextResponse.redirect(url, { status: 303 });
}

import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const ANON_COOKIE = "detox_anon_id";
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api/");

  let response: NextResponse;
  if (isApi) {
    // /api/* skips intl + Supabase auth refresh — those are page-only concerns.
    response = NextResponse.next();
  } else {
    // 1) Let next-intl resolve locale + redirect/rewrite.
    const intlResponse = intlMiddleware(request);
    response = intlResponse ?? NextResponse.next();
  }

  // 2) Mint the anonymous cookie at the edge if missing — applies to ALL
  //    requests (pages and API). Server Components cannot modify cookies
  //    during streaming render, so middleware is the only safe write path
  //    that works uniformly.
  if (!request.cookies.get(ANON_COOKIE)) {
    const newAnon = crypto.randomUUID();
    request.cookies.set(ANON_COOKIE, newAnon);
    response.cookies.set(ANON_COOKIE, newAnon, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ANON_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  if (isApi) {
    return response;
  }

  // 3) Refresh Supabase auth session for page requests, threading cookies
  //    onto the same response.
  return updateSession(request, response);
}

// Run on every request, but skip Next internals and static assets.
// (We deliberately include /api/* so the anon cookie is minted there too.)
export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};

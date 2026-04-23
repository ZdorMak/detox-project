import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1) Let next-intl resolve locale + redirect/rewrite.
  const intlResponse = intlMiddleware(request);
  // intlMiddleware can return undefined when no rewrite/redirect is needed.
  const response = intlResponse ?? NextResponse.next();
  // 2) Refresh Supabase auth session, threading cookies onto the same response.
  return updateSession(request, response);
}

// Run on every page request, but skip Next internals, static assets, and API.
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

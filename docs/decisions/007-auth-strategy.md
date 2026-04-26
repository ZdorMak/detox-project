# ADR 007 — Authentication strategy: anonymous-first + optional OAuth/magic-link

**Date:** 2026-04-23
**Status:** Accepted

## Context

The project has been anonymous-only by design (ADR-001 and the
GDPR-compliant pillar). Adding accounts unlocks two real use cases:

1. **Cross-device sync** — student starts on phone at home, continues on
   school laptop, comes back to results.
2. **Teacher dashboards** — class-level aggregates require teachers to
   authenticate so RLS can scope what they see.

The risk: PII (email) entering the system at all expands the GDPR
surface and could spook the school administrators who agreed to pilot
based on the "no personal data" line.

## Decision

**Anonymous-first, optional sign-in.**

- Anonymous play continues exactly as before — `detox_anon_id` cookie,
  no auth required to do anything user-facing.
- Sign-in is offered (not forced) on the landing page (top-right user
  menu) and via a future "Save my progress" CTA in the game. Tapping
  sign-in opens `/login` with three paths:
  - Google OAuth
  - Apple OAuth
  - Magic-link via email (universal fallback; works without any provider
    configuration)
- On successful sign-in, the current anonymous session is **claimed**:
  `sessions.user_id` is set to the new `auth.users.id`. Same browser
  with the same cookie continues to see the same progress; signing in
  on a second device that has a fresh cookie creates a *new* anonymous
  session that is *also* tied to the same user, and we union the data
  in the profile / certificate views (W4-1 work).

## Why all three providers

- **Google** is what 80% of EU students with phones already use through
  Google Workspace for Education. Lowest friction.
- **Apple** is needed for iOS users who don't want a Google account on
  their school device. Apple's "Sign in with Apple" hides the email
  behind a relay address — bonus privacy.
- **Magic-link** is the universal fallback. No Google account required,
  no Apple Developer fee, works from any email. Crucially, it works
  *without any provider configuration at all* — Supabase enables email
  auth by default. So our login page is functional from day one even if
  Maksym never sets up the OAuth providers.

## Trade-offs accepted

- **PII appears for signed-in users.** Email is stored in
  `auth.users.email` and mirrored into `players.email`. The privacy
  policy and consent banner need updates before we publish — flagged as
  a TODO in W4 backlog.
- **Apple OAuth requires $99/year.** We surface this in
  `docs/auth-setup.md` as an explicit "skip for now" option. The button
  is in the UI; clicks fail gracefully with a clear error if Apple
  isn't configured.
- **Cross-device merging is partial in v1.** Two devices = two
  `sessions` rows tied to the same `user_id`. The profile page sums
  attempts across them, but completed-card-set deduplication is at the
  card_id level (already correct). Stretch goal post-SOUK: merge into a
  canonical session per user.

## Files this decision creates / changes

- New: `supabase/migrations/005_players_and_session_linkage.sql` (applied via MCP)
- New: `src/app/[locale]/login/page.tsx`
- New: `src/components/auth/LoginForm.tsx` (client island, 3 sign-in paths)
- New: `src/components/auth/UserMenu.tsx` (server-rendered chip)
- New: `src/app/auth/callback/route.ts` (code exchange + session claim)
- New: `src/app/auth/signout/route.ts`
- New: `docs/auth-setup.md` (manual provider configuration steps)
- Updated: `src/app/[locale]/page.tsx` (UserMenu in top-right corner)
- Updated: `src/types/supabase.ts` (players + sessions.user_id)
- Updated: `messages/fr.json`, `messages/en.json` (auth namespace)

## TODO before SOUK

- [ ] Update GDPR consent banner with sign-in clause.
- [ ] Update privacy policy (links from footer) — covers email storage.
- [ ] Add "Save my progress" CTA in `/jeu` profile that nudges anonymous
  players to claim. Don't make it nag-y.
- [ ] Configure Google OAuth (10 min, free). Without it the Google button
  fails with a Supabase error message — usable but ugly.
- [ ] Wire `players.school_id` from a teacher invite link so a class can
  join under one school for the dashboard (W4-1).

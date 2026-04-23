# Architecture

> Living document — updated whenever a non-trivial decision is made. ADRs in `docs/decisions/`.

## Big picture

```
┌──────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Browser / PWA   │ ─→ │  Next.js 15 (Vercel) │ ─→ │  Supabase (Frankfurt)│
│  React 19, TS    │    │  App Router + API    │    │  Postgres + Auth+RLS │
└──────────────────┘    └──────────────────────┘    └──────────────────────┘
        ↑                         │
        │                         ↓ (admin)
   localStorage           service_role writes
   (consent)             for anon flows + audit
```

- **Visitor (anonymous)** → goes through `/` (FR default) or `/en`. Cookie `detox_anon_id` (httpOnly) carries `anonymous_id`. Writes go through API routes using the service-role key — RLS still on, but bypassed for trusted server code.
- **Teacher (authenticated)** — added in Week 4. Magic-link auth. Reads only — RLS scopes results to their `school_id` via `current_teacher_school_id()`.

## Routing

- `localePrefix: "as-needed"` — FR has no prefix (`/`), EN is `/en`.
- All localized pages under `src/app/[locale]/`.
- Middleware (`src/middleware.ts`) chains `next-intl` → Supabase session refresh on the same response.

## Data model

| Table | Owner | RLS posture |
|---|---|---|
| `schools` | teachers can `SELECT` their own | enabled |
| `teachers` | own row only | enabled |
| `sessions` | service_role writes; teachers read for their school | enabled |
| `video_events` | service_role writes; teachers read scoped to school | enabled |
| `survey_responses` | service_role writes; teachers read scoped to school | enabled |
| `consent_log` | service_role only | enabled |
| `error_log` | service_role only | enabled |

Helper: `current_teacher_school_id()` (SECURITY DEFINER) — used inside policies so teachers can be scoped without granting `SELECT` on `teachers` table broadly.

## Privacy

- **No PII collected**. `user_agent_hash` and `ip_hash` are SHA-256, never stored raw.
- Cookies: only `detox_anon_id` (httpOnly, sameSite=lax). No third-party analytics.
- GDPR consent recorded in `consent_log`; default state is **decline** until user grants.

## Multi-tenancy

`school_id` is a nullable foreign key on `sessions`. Direct visitors have `school_id = NULL`; school participants get the school's UUID injected (mechanism added in Week 4 alongside teacher onboarding).

## i18n strategy

- `messages/fr.json` is the source of truth — written by hand.
- `messages/en.json` is the fallback — kept in sync (later: a CI check fails if keys diverge).
- Only `useTranslations()` / `getTranslations()` reads them.

## State management

- React state for UI.
- Supabase as the single source of truth for persisted state.
- localStorage for consent only.
- No global state library (Redux / Zustand) — App Router server components do most of the heavy lifting.

## Build / deploy

- Local: `npm run dev`.
- Vercel auto-deploy on push to `main` (preview on every branch).
- Supabase migrations applied via Supabase MCP (`apply_migration`); SQL also stored in `supabase/migrations/` for record.

## Open questions / pending

- Teacher auth flow design (Week 4).
- Where the interactive video assets live — Supabase Storage vs. Vercel Blob (Week 3 decision).
- Whether to expose a public impact dashboard for grant-reporting purposes (post-MVP).

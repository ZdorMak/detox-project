# Detox Project

> Interactive web experience about smartphone addiction. Built for schools in Vaud and Berne (Switzerland), with a public version for direct visitors. Final presentation at **SOUK HEFP, Renens — 27 May 2026**.

[![Stack](https://img.shields.io/badge/stack-Next.js%2015%20·%20Supabase%20·%20Tailwind-0F766E)](#stack)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## What it does

Visitors watch an interactive video with branching choice points and complete a scientifically validated questionnaire (**SAS-SV** — Smartphone Addiction Scale, short version). Anonymous statistics are aggregated; teachers receive a class-level dashboard.

**Audiences**

- **Primary** — Vaud / Berne schools (B2B, 300–800 CHF/school/year)
- **Secondary** — direct visitors (free, public good)

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 3 + shadcn-style primitives |
| i18n | next-intl (FR primary, EN fallback) |
| Backend | Next.js API routes |
| Database | Supabase (Postgres + Auth + RLS), region `eu-central-1` (Frankfurt) |
| Forms | react-hook-form + zod |
| Charts | Recharts |
| Video | video.js (added Week 3) |
| Hosting | Vercel |

## Voice & content

These rules apply to all FR copy in the product. They keep the editorial tone consistent and make AI-assisted PRs respect the brand register.

- **Pronouns:** `tu` / `toi`, never `vous`. Inclusive forms: `engagé·e`, `ami·es`, `enseignant·es`.
- **Tone:** calm, observational, non-judgemental. *Lecture honnête*, *signal*, never *évaluation* / *verdict*.
- **No emoji.** One exception in the codebase: 🖨️ on the print button. Don't add others.
- **Casing:** sentence case body and CTAs. UPPERCASE only via `.cd-mono`.
- **The `<em>` rule:** in any display headline, the emotional payload goes inside `<em>` — it renders italic + amber via CSS. Every section header has one.
- **French typography:** non-breaking space before `?` `!` `:` `;` and inside `« … »`. Em-dashes (`—`) for asides.
- **Numbers:** Swiss conventions (`4 h 37 min`, `300–800 CHF`, `96 fois par jour`, 24-h clock).
- **Length:** hero headlines ≤ 2 lines. Card body ≤ 26ch. Question titles 1 line.
- **Hard nos:** marketing puff (*révolutionnaire*), gamified shaming (*tu as échoué*), score-as-verdict language ("you failed", "addicted", "diagnosed").

The accent palette is intentionally minimal: one amber accent (`--cd-accent`), one good (`--good`), one danger (`--danger`). Don't invent new accents. The `--pillar-*` palette is reserved for the 7-pillar grid on the landing page.

## Seven mandatory pillars

Every feature ties back to at least one of these axes:

1. **Durable** — GDPR, open-source questionnaire, maintainable code, CI/CD.
2. **Addiction** — SAS-SV / SABAS science base, responsible narrative.
3. **Collaboration** — teacher dashboard, exports, multi-tenant data model.
4. **Innovation** — branching video, real-time stats, modern UX.
5. **Smartphone** — mobile-first, PWA-ready, touch-optimised.
6. **Interdisciplinaire** — psychology + UX + public health + data science.
7. **Accessible** — WCAG 2.1 AA, keyboard navigation, screen readers.

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env.local
# - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are pre-filled.
# - Paste SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard
#   (Project Settings -> API -> service_role).

# 3. Run dev server
npm run dev
# Open http://localhost:3000
```

> **Routing:** FR has no prefix (`/`), EN is prefixed (`/en`).

## Project structure

```
src/
  app/
    [locale]/          # all localized pages live here
      layout.tsx       # root layout, NextIntlClientProvider
      page.tsx         # landing
    api/
      session/route.ts # POST anon session bootstrap
      consent/route.ts # POST GDPR consent decision
    not-found.tsx
    globals.css
  components/
    consent/           # GDPR banner
    landing/           # hero, pillars, footer
    ui/                # shadcn-style primitives
  hooks/
    use-session.ts     # client hook returning sessionId
  i18n/
    routing.ts         # locales + prefix policy
    request.ts         # message loader for next-intl
    navigation.ts      # locale-aware Link / hooks
  lib/
    supabase/
      client.ts        # browser client (anon key)
      server.ts        # SSR client (anon key)
      admin.ts         # service-role client for trusted writes
      middleware.ts    # session refresh
    consent.ts         # localStorage consent state
    session.ts         # server-side anon-session helpers
    utils.ts           # cn(), sha256Hex()
  middleware.ts        # next-intl + Supabase session refresh
  types/
    supabase.ts        # generated DB types
messages/
  fr.json
  en.json
supabase/
  migrations/          # SQL migrations (mirror of MCP-applied state)
docs/
  architecture.md
  decisions/           # ADRs
  backlog.md           # backlog for Weeks 2–5
```

## Database

Schema, RLS policies and indexes are managed via Supabase migrations. Initial migration: `supabase/migrations/001_initial_schema.sql` (also applied via the Supabase MCP server in `apply_migration`).

Tables: `schools`, `teachers`, `sessions`, `video_events`, `survey_responses`, `consent_log`, `error_log`.

RLS is **enabled on every table**. Anonymous writes go through API routes using the service-role key (which bypasses RLS). Teacher reads are scoped to their school via `current_teacher_school_id()`.

## Roadmap

| Week | Window | Focus |
|---|---|---|
| 1 | 23–29 Apr 2026 | **Foundation** (this PR): scaffold, schema, i18n, landing, GDPR. |
| 2 | 30 Apr – 6 May | SAS-SV survey, anonymous storage, video event API. |
| 3 | 7–13 May | Interactive video script, branching playback, tracking. |
| 4 | 14–20 May | Teacher dashboard, PDF exports, accessibility audit, E2E. |
| 5 | 21–26 May | Pitch deck, HEFP report, production deploy. Buffer to 27 May. |

See [docs/backlog.md](docs/backlog.md) for atomic task breakdown.

## Contributing / conventions

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) in English (`feat:`, `fix:`, `chore:`).
- **Branches**: `feature/week-N-task-name`, `fix/issue-N`.
- **PRs**: title is a clear summary; body includes a checklist + which pillar(s) the change supports.
- **Comments**: English. **UI copy**: French primary, English fallback (always via i18n).
- **Errors**: never silently swallowed — log to `error_log` table.
- **Secrets**: never in code or git; only in Vercel env vars and Supabase.

## Licence

Open-source parts (questionnaire, methodology, components) under MIT. See `LICENSE` (added in Week 4 alongside accessibility audit).

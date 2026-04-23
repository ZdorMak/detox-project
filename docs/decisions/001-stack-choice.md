# ADR 001 — Stack choice (Next.js 15 + Supabase + Vercel)

**Date:** 2026-04-23
**Status:** Accepted

## Context

Solo developer, 5 weeks to ship a French-first interactive web experience for Swiss schools. Needs: anonymous + authenticated auth, multi-tenant data model, GDPR compliance, mobile-first UI, EU data residency.

## Decision

- **Next.js 15 (App Router) + React 19 + TypeScript strict.** Mainstream, well-supported, familiar.
- **Tailwind 3 + shadcn-style primitives** instead of full shadcn CLI. Fewer moving parts.
- **next-intl** for i18n; FR default, EN fallback, prefix `as-needed`.
- **Supabase (Frankfurt, eu-central-1)** for DB + Auth + RLS. EU residency satisfies GDPR for Swiss users; magic-link auth covers teachers.
- **Vercel** for hosting, with auto-deploy from GitHub. Personal account is fine for MVP.

## Alternatives considered

- **Remix or SvelteKit** — both viable, but Next.js has the largest ecosystem and Vercel deploy is friction-free.
- **Self-hosted Postgres + custom auth** — too much work for a 5-week solo project.
- **PlanetScale / Neon** — no built-in Auth + Realtime + Storage; would need to glue components together.

## Consequences

- We're locked in to Vercel-friendly patterns (Edge runtime caveats for service-role writes — keep API routes on Node runtime).
- Supabase free tier limits (500 MB DB, 1 GB egress) are fine for a school-pilot scale; if we grow, upgrade is one click.

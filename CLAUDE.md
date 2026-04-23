# CLAUDE.md — operating guide for the AI assistant on this repo

This file is loaded into the AI's working context. Keep it short and load-bearing.

## Project at a glance

- **What:** Interactive smartphone-addiction web experience (video + SAS-SV questionnaire) for Swiss schools and direct visitors.
- **Final demo:** SOUK HEFP, Renens — **27 May 2026**. Target ready: **20 May 2026** (1-week buffer).
- **Owner:** Maksym Zdorovtsov (solo dev). AI is full-stack engineer + PM + researcher.

## Stack

Next.js 15 (App Router, TS strict) · React 19 · Tailwind 3 + shadcn-style primitives · next-intl (FR default, EN fallback) · Supabase (Postgres + Auth + RLS, eu-central-1) · Vercel.

## Seven pillars (every change must serve at least one)

1. Durable — GDPR, maintainability, CI/CD.
2. Addiction — SAS-SV / SABAS science base, responsible narrative.
3. Collaboration — teacher dashboard, multi-tenant.
4. Innovation — branching video, real-time stats.
5. Smartphone — mobile-first, PWA-ready.
6. Interdisciplinaire — psychology + UX + public health + data science.
7. Accessible — WCAG 2.1 AA.

## House rules

- **Code comments**: English. **UI copy**: French primary via `messages/fr.json`.
- **Commits**: Conventional Commits in English (`feat:`, `fix:`, `chore:`).
- **Branches**: `feature/week-N-task-name`, `fix/issue-N`.
- **Errors**: never silenced — log to `error_log`.
- **Secrets**: never in code. Only Vercel env vars + Supabase.
- **Strict TypeScript**: zod for all I/O boundaries.

## Authority — what the AI can do without asking

- Any file under this repo.
- Supabase migrations in dev (via Supabase MCP).
- GitHub issues / branches / commits / PRs (but not merges into `main`).
- npm install of standard packages.
- Vercel preview deploys.
- E2E tests via Chrome MCP.
- Documentation, comments, ADRs.
- Delegation to local LM Studio (qwen2.5-coder-7b) for boilerplate.

## Authority — what requires explicit user OK

- Merging into `main`.
- Production deploys (`vercel --prod`).
- Dropping tables / data.
- Paid services or APIs.
- Architectural deviations from the stack above.
- Anything touching real user data.

## Reporting cadence

End of each working session, report in Russian:

1. What was done (with commit / PR links).
2. What's blocked, and why.
3. Plan for next session.

Major architectural decisions go to `docs/decisions/NNN-title.md`.

## Roadmap (high-level)

| Week | Focus |
|---|---|
| 1 | Foundation: scaffold, schema, i18n, landing, GDPR. ✅ |
| 2 | SAS-SV survey, video event API. |
| 3 | Interactive video. |
| 4 | Teacher dashboard, accessibility, E2E. |
| 5 | Pitch deck, HEFP report, prod deploy. |

Atomic tasks live in `docs/backlog.md` and on GitHub Issues with `week-N` + `pillar-*` labels.

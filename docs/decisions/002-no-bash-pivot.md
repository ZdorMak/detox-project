# ADR 002 — Scaffolding without `npx create-next-app`

**Date:** 2026-04-23
**Status:** Accepted (Week 1 only — revisit if sandbox returns)

## Context

The Cowork-mode Linux sandbox failed to boot during the Week 1 session, so `npx create-next-app`, `npm install` and `git` were not available to the AI. The project root was also under `C:\Projects\` which is not mounted into the sandbox.

## Decision

1. Relocate the project root to `C:\Users\geron\Projects\detox-project` (under the user's mounted workspace folder), so future sessions with a working sandbox can run shell commands.
2. Hand-write every scaffold file (`package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, ESLint config, source files) via the file tools.
3. Owner runs `npm install` and the initial `git push` once on Windows. From then on, code changes flow through the AI; commit/push is a one-liner the owner runs (or, when sandbox is back, the AI runs).

## Consequences

- Slightly more brittle: dependency versions are pinned manually rather than picked by `create-next-app`. If a peer-dep mismatch shows up, owner sees it during `npm install` and we fix together.
- No `package-lock.json` until first `npm install` runs locally; Vercel will install fresh on first build.
- This decision is **not permanent** — once the sandbox is reachable, normal CLI workflows resume.

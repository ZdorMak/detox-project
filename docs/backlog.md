# Backlog — Weeks 2–5

> Source of truth for atomic tasks until they are filed as GitHub Issues. The
> Week 1 session could not call the GitHub API directly (no GitHub MCP server
> connected, no shell access to `gh`), so issues live here for now.
>
> **To file these as GitHub Issues**, run from the repo root once the GitHub
> CLI is available locally:
>
> ```bash
> # Install GH CLI if needed: https://cli.github.com/
> gh auth login
> bash scripts/file-backlog-issues.sh
> ```
>
> See `scripts/file-backlog-issues.sh` for the script (Week 1 deliverable).

## Labels to create first

`week-2`, `week-3`, `week-4`, `week-5`,
`pillar-durable`, `pillar-addiction`, `pillar-collaboration`,
`pillar-innovation`, `pillar-smartphone`, `pillar-interdisciplinaire`,
`pillar-accessible`.

---

## Week 2 — Core (30 Apr – 6 May)

### #W2-1 — SAS-SV questionnaire content (FR)

**Labels:** `week-2`, `pillar-addiction`, `pillar-interdisciplinaire`
**Acceptance criteria:**

- 10 SAS-SV items rendered in French, scored on the validated 6-point Likert scale.
- Translation matches a peer-reviewed FR adaptation (cite source in code comments).
- Items live in a typed config (`src/lib/survey/sas-sv.ts`), not hard-coded in JSX.

### #W2-2 — Survey UI flow

**Labels:** `week-2`, `pillar-smartphone`, `pillar-accessible`
**Acceptance criteria:**

- One question per screen on mobile; group of 3 on desktop.
- Progress bar; previous/next; can resume after refresh (state in DB, not localStorage).
- Keyboard navigation: Tab + 1–6 number keys to answer.
- WCAG 2.1 AA: clear focus rings, sufficient contrast, ARIA labels.

### #W2-3 — Persist responses to `survey_responses`

**Labels:** `week-2`, `pillar-durable`
**Acceptance criteria:**

- POST `/api/survey/answer` writes one row per answered question.
- Idempotent on `(session_id, question_id)` — re-answering updates rather than duplicates.
- Validated with zod; failed inserts logged to `error_log`.

### #W2-4 — Result page + score interpretation

**Labels:** `week-2`, `pillar-addiction`, `pillar-accessible`
**Acceptance criteria:**

- After last answer, show total score, banded interpretation (low / moderate / high).
- Wording reviewed for non-stigmatising framing — explicit reference to ADR or doc note.
- Resources block with Pro Juventute / Promotion Santé Suisse links.

### #W2-5 — Video event tracking API

**Labels:** `week-2`, `pillar-innovation`
**Acceptance criteria:**

- POST `/api/video/event` accepts `{ event_type, timestamp_ms, video_position_s, metadata }`.
- Validated with zod; rejects unknown event types.
- Batched: client may POST an array of up to 50 events at once.

### #W2-6 — Session resume

**Labels:** `week-2`, `pillar-durable`, `pillar-smartphone`
**Acceptance criteria:**

- On second visit with same `detox_anon_id` cookie, user lands on the right step (survey / video / results).
- Server reads `sessions.completed_at` + last answered question to compute next step.

---

## Week 3 — Video (7–13 May)

### #W3-1 — Interactive video script (FR)

**Labels:** `week-3`, `pillar-innovation`, `pillar-addiction`
**Acceptance criteria:**

- 2–3 branching choice points; total runtime ≤ 4 min.
- Script reviewed for responsible-narrative tone (no shaming, no triggering content).
- Storyboard in `docs/video/storyboard.md`.

### #W3-2 — Video assets pipeline

**Labels:** `week-3`, `pillar-durable`
**Acceptance criteria:**

- ADR chooses Supabase Storage vs. Vercel Blob.
- Encodes: 720p H.264 + 480p fallback; subtitles VTT (FR + EN).
- Total bundle < 50 MB across choice paths.

### #W3-3 — video.js integration with branching

**Labels:** `week-3`, `pillar-innovation`, `pillar-smartphone`
**Acceptance criteria:**

- Branch selection UI overlays player at choice points; reachable by keyboard.
- Each choice writes `event_type='branch_choice'` with metadata.
- Mobile autoplay policy respected (require tap to start).

### #W3-4 — Video → survey handoff

**Labels:** `week-3`, `pillar-collaboration`
**Acceptance criteria:**

- After video, auto-redirect to first survey question, scroll to top.
- Session `started_at` updated with first-video-play time if not already set.

---

## Week 4 — Polish (14–20 May)

### #W4-1 — Teacher magic-link auth

**Labels:** `week-4`, `pillar-collaboration`
**Acceptance criteria:**

- `/teacher/login` page sends magic link via Supabase Auth.
- After login, row in `teachers` upserted with `school_id` from invite.
- `/teacher/dashboard` is auth-only (redirect on unauthenticated).

### #W4-2 — Aggregated dashboard for teachers

**Labels:** `week-4`, `pillar-collaboration`, `pillar-interdisciplinaire`
**Acceptance criteria:**

- Charts (Recharts): completion rate, score distribution, average video drop-off.
- All queries are `school_id`-scoped via RLS — verified by tests with two schools.
- No individual-level data exposed; minimum N=5 per chart bucket.

### #W4-3 — PDF report export

**Labels:** `week-4`, `pillar-collaboration`, `pillar-durable`
**Acceptance criteria:**

- `/teacher/dashboard/export` produces a PDF (≤ 5 pages) summarising the class.
- Built via the `pdf` skill (server-side render).
- French only for v1.

### #W4-4 — Accessibility audit (WCAG 2.1 AA)

**Labels:** `week-4`, `pillar-accessible`
**Acceptance criteria:**

- axe-core run via Playwright on `/`, `/en`, `/survey`, `/teacher/dashboard`: zero serious / critical issues.
- Keyboard-only walkthrough script in `docs/a11y/keyboard-walkthrough.md`, recorded as a video.
- All interactive elements have visible focus + aria-labels.

### #W4-5 — Lighthouse 90+ performance

**Labels:** `week-4`, `pillar-smartphone`, `pillar-accessible`
**Acceptance criteria:**

- Mobile Lighthouse: Performance ≥ 90, A11y 100, Best Practices ≥ 95, SEO ≥ 95.
- Image lazy-load + `next/image` everywhere.
- No blocking third-party scripts.

### #W4-6 — Full i18n pass

**Labels:** `week-4`, `pillar-accessible`, `pillar-durable`
**Acceptance criteria:**

- Every UI string flows through `useTranslations()`.
- CI script fails if `fr.json` and `en.json` keys diverge.

### #W4-7 — E2E tests (Playwright via Chrome MCP)

**Labels:** `week-4`, `pillar-durable`
**Acceptance criteria:**

- Happy paths: anon visit → consent → video → survey → results.
- Teacher path: magic-link → dashboard → export.
- Run on every PR (later: GitHub Actions).

---

## Week 5 — Présentation (21–26 May)

### #W5-1 — Pitch deck (FR, 10 slides)

**Labels:** `week-5`
**Acceptance criteria:**

- Built via `pptx` skill.
- Structure: problem, solution, science base, demo, business model, impact, next steps, ask.
- Reviewed with one external reader before SOUK.

### #W5-2 — Demo script + dry runs

**Labels:** `week-5`
**Acceptance criteria:**

- 5-minute demo script in `docs/demo-script.md`.
- Two recorded rehearsals; offline fallback (recorded video) if Wi-Fi at SOUK is flaky.

### #W5-3 — HEFP methodology report

**Labels:** `week-5`, `pillar-interdisciplinaire`
**Acceptance criteria:**

- Built via `docx` skill.
- Sections: research question, science base (SAS-SV citation), method, results sample, ethics, limitations, next steps.

### #W5-4 — Production deploy + monitoring

**Labels:** `week-5`, `pillar-durable`
**Acceptance criteria:**

- `vercel --prod` deploy approved by owner.
- Custom domain + HTTPS verified.
- Supabase backup snapshot the day before SOUK.

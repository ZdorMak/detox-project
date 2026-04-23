#!/usr/bin/env bash
# Files all backlog items from docs/backlog.md as GitHub Issues.
# Requires: gh CLI authenticated (`gh auth login`) and the `detox-project` repo.
#
# Usage: bash scripts/file-backlog-issues.sh
set -euo pipefail

REPO="ZdorMak/detox-project"

echo "→ creating labels (idempotent)"
labels=(
  "week-2:#1d76db"
  "week-3:#1d76db"
  "week-4:#1d76db"
  "week-5:#1d76db"
  "pillar-durable:#0F766E"
  "pillar-addiction:#B91C1C"
  "pillar-collaboration:#7C3AED"
  "pillar-innovation:#0284C7"
  "pillar-smartphone:#65A30D"
  "pillar-interdisciplinaire:#D97706"
  "pillar-accessible:#0EA5E9"
)
for entry in "${labels[@]}"; do
  name="${entry%%:*}"
  color="${entry##*:}"
  color="${color#'#'}"
  gh label create "$name" --repo "$REPO" --color "$color" --force >/dev/null 2>&1 || true
done

create() {
  local title="$1" labels_csv="$2" body="$3"
  echo "→ creating: $title"
  gh issue create --repo "$REPO" --title "$title" --label "$labels_csv" --body "$body" >/dev/null
}

# Week 2
create "W2-1 — SAS-SV questionnaire content (FR)" "week-2,pillar-addiction,pillar-interdisciplinaire" \
"Render the 10 SAS-SV items in French (Likert 1–6). Use a peer-reviewed FR adaptation; cite source. Items live in src/lib/survey/sas-sv.ts as a typed config."
create "W2-2 — Survey UI flow" "week-2,pillar-smartphone,pillar-accessible" \
"One question per screen on mobile, group of 3 on desktop. Progress bar, prev/next, resume on refresh (state in DB). Keyboard nav (Tab + 1–6). WCAG 2.1 AA."
create "W2-3 — Persist responses to survey_responses" "week-2,pillar-durable" \
"POST /api/survey/answer writes one row per answered question. Idempotent on (session_id, question_id). zod validation; failures logged to error_log."
create "W2-4 — Result page + score interpretation" "week-2,pillar-addiction,pillar-accessible" \
"After last answer: total score + banded interpretation. Non-stigmatising wording; resources block with Pro Juventute & Promotion Santé Suisse."
create "W2-5 — Video event tracking API" "week-2,pillar-innovation" \
"POST /api/video/event accepts { event_type, timestamp_ms, video_position_s, metadata }. Batched (up to 50). zod validation."
create "W2-6 — Session resume" "week-2,pillar-durable,pillar-smartphone" \
"On second visit, jump to right step (survey / video / results) based on session state."

# Week 3
create "W3-1 — Interactive video script (FR)" "week-3,pillar-innovation,pillar-addiction" \
"2–3 branching choice points; total ≤ 4 min. Responsible-narrative tone. Storyboard in docs/video/storyboard.md."
create "W3-2 — Video assets pipeline" "week-3,pillar-durable" \
"ADR chooses storage. 720p + 480p; VTT subtitles FR/EN. Total bundle < 50 MB."
create "W3-3 — video.js integration with branching" "week-3,pillar-innovation,pillar-smartphone" \
"Branch UI overlays player; keyboard reachable. branch_choice events written. Mobile autoplay policy respected."
create "W3-4 — Video → survey handoff" "week-3,pillar-collaboration" \
"Auto-redirect to first survey question after video; sessions.started_at updated."

# Week 4
create "W4-1 — Teacher magic-link auth" "week-4,pillar-collaboration" \
"Magic-link via Supabase Auth at /teacher/login. Upsert teachers row with school_id from invite. /teacher/dashboard is auth-only."
create "W4-2 — Aggregated dashboard for teachers" "week-4,pillar-collaboration,pillar-interdisciplinaire" \
"Recharts: completion rate, score distribution, video drop-off. school_id-scoped via RLS. Min N=5 per bucket."
create "W4-3 — PDF report export" "week-4,pillar-collaboration,pillar-durable" \
"/teacher/dashboard/export produces a PDF (≤ 5 pages) via pdf skill. French only for v1."
create "W4-4 — Accessibility audit (WCAG 2.1 AA)" "week-4,pillar-accessible" \
"axe-core via Playwright on /, /en, /survey, /teacher/dashboard: zero serious/critical issues. Keyboard walkthrough recorded."
create "W4-5 — Lighthouse 90+ performance" "week-4,pillar-smartphone,pillar-accessible" \
"Mobile Lighthouse: Perf ≥ 90, A11y 100, Best Pract ≥ 95, SEO ≥ 95."
create "W4-6 — Full i18n pass" "week-4,pillar-accessible,pillar-durable" \
"Every UI string via useTranslations. CI fails if fr.json and en.json keys diverge."
create "W4-7 — E2E tests (Playwright via Chrome MCP)" "week-4,pillar-durable" \
"Happy paths covered. Run on every PR."

# Week 5
create "W5-1 — Pitch deck (FR, 10 slides)" "week-5" \
"Build via pptx skill. Structure: problem, solution, science, demo, business, impact, next, ask. External reader review."
create "W5-2 — Demo script + dry runs" "week-5" \
"5-minute script in docs/demo-script.md. Two rehearsals; offline fallback ready."
create "W5-3 — HEFP methodology report" "week-5,pillar-interdisciplinaire" \
"Build via docx skill. Sections: research question, SAS-SV cite, method, results, ethics, limitations, next."
create "W5-4 — Production deploy + monitoring" "week-5,pillar-durable" \
"vercel --prod (owner-approved). Custom domain + HTTPS. Supabase backup snapshot day before SOUK."

echo "✓ done"

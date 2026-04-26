# ADR 006 — Progression system: levels, achievements, programs, certificate

**Date:** 2026-04-23
**Status:** Accepted (extension to ADR-005)

## Context

The base challenge game (ADR-005) had two states for the player: "I drew a
card" and "I did/skipped/declined it". That's enough mechanics for a
prototype but not enough to keep someone engaged across days. We need
intrinsic motivation: visible growth, celebrated milestones, and a way for
the user to point at something at the end and say "I did this."

## Decision

Add four overlapping but independent systems on top of the existing card
deck:

1. **Levels** — 5 ranks (Débutant·e → Maître), purely a function of
   `totalCompleted`. Gives every player a smooth ladder, no "you have to
   finish a program" gate.
2. **Achievements** — 12 unlockable badges, evaluated server-side after
   every successful `/api/challenges/log` insert. Diff-and-insert pattern
   means the rule engine is idempotent and concurrent-safe.
3. **Programs** — 4 themed ordered tracks of cards. Programs share the
   global card deck and global progression — completing a program card
   ALSO bumps your level and counts toward category achievements.
4. **Certificate** — a printable summary at `/jeu/certificat`. Server-rendered
   HTML + the browser's "Print → Save as PDF" pipeline. No PDF library, no
   external service.

## Why this shape

- **Levels are passive.** A player who never reads the achievements list
  still sees their level go up. The game is rewarding even at zero
  conscious engagement with the meta-systems.
- **Achievements are declarative.** Each rule is a pure function of the
  attempt history (see `achievements.ts`). Adding a new badge means
  appending one entry; no schema migration, no UI rework. The display is
  driven by the same data.
- **Programs reuse cards.** No duplicate authoring; "Bouge ton corps"
  references existing movement cards. Authors who add cards later
  automatically expand both casual play and any program that lists them.
- **Certificate is HTML, not PDF.** Browser print → "Save as PDF" works
  identically on every modern device, and the certificate is also
  shareable as a screenshot. No `pdfkit`, `puppeteer`, or paid service.
  When a school wants letterhead-style PDFs at scale we can layer on the
  `pdf` skill from a server action — the data shape is already right.

## Achievement rule mechanics

Server-side `/api/challenges/log` flow:

1. Insert the new attempt row.
2. SELECT the full attempt history for this session (small — bounded by
   deck size × repetitions, typically under 100 rows).
3. Run all 12 rules over that history (`evaluateAllAchievements`).
4. Diff against the existing `achievements_unlocked` rows.
5. INSERT the new ones. UNIQUE constraint on
   `(session_id, achievement_id)` makes step 5 safe under concurrent
   double-clicks.
6. Return the new ids in the response so the client can show toasts.

The "program_first" achievement uses a sentinel attempt with
`card_id = "__program_completed__"` posted by the program runner when a
track ends. Allowing the sentinel through `/api/challenges/log` (with a
guard) keeps the rule engine inside one file instead of spreading
program-aware logic across endpoints.

## Files this decision creates / changes

- New: `supabase/migrations/004_programs_and_achievements.sql` (applied via MCP)
- New: `src/lib/challenges/levels.ts`, `achievements.ts`, `programs.ts`
- New: `src/app/api/challenges/profile/route.ts`,
  `src/app/api/challenges/program-step/route.ts`
- New: `src/app/[locale]/jeu/profil/page.tsx`,
  `jeu/programmes/page.tsx`,
  `jeu/programmes/[id]/page.tsx`,
  `jeu/certificat/page.tsx`
- New: `src/components/challenges/AchievementToast.tsx`,
  `Certificate.tsx`, `PrintButton.tsx`, `ProgramRunner.tsx`
- Updated: `src/app/api/challenges/log/route.ts` (achievement diff + sentinel)
- Updated: `src/app/[locale]/jeu/page.tsx` (level pill + nav)
- Updated: `src/components/challenges/Game.tsx` (toast pipe)
- Updated: `src/types/supabase.ts` (new tables)
- Updated: `messages/fr.json`, `messages/en.json` (levels, achievements, programs, certificate, profile, nav)

## Trade-offs accepted

- The certificate is layout-styled with Tailwind, not a typographer's
  print template. It looks clean but won't beat a hand-designed PDF for a
  formal school award. Acceptable for v1; revisit if SOUK jurors flag it.
- Achievement rules run on every log insert. With a 30-card deck +
  ≤ 100-row history this costs <50 ms; if cards ever multiply by 10× we'd
  precompute aggregates instead of re-running rules.
- Programs duplicate the casual-play loop's card-rendering UI in
  `ProgramRunner`. We accepted the duplication over a generic component
  because the flows diverge enough (no LocationPicker, fixed sequence,
  forced redirect on completion) that an abstraction would have been
  costly to type correctly.

## TODO before SOUK

- [ ] Pilot the achievements with 3 HEFP classmates — flag any that feel
  patronising or unclear.
- [ ] Cohort metrics on the teacher dashboard (W4): how many students
  reached level 3+, which achievements are most/least earned.
- [ ] Consider a small "share certificate" link (Twitter / WhatsApp) once
  legal review confirms the absence of PII makes it safe.

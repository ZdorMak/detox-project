# ADR 005 — "Pose le téléphone" challenge mini-game

**Date:** 2026-04-23
**Status:** Accepted (extension to Week 3 scope)

## Context

After the survey + experience were live, we asked: what if the mini-game
*itself* gave the user a reason to put the phone down? Most "digital
detox" apps are ironic — they live on the phone they want you to leave.

## Decision

A challenge-card deck of 30 cards, honor-system based. The player draws
a card, the card invites them to do something offline, and they self-report
the outcome (`completed` / `skipped` / `declined`). Stats persist per
anonymous session.

## Mechanics

- 30 cards across 5 categories: observation, social, movement, creative,
  reflection. 6 cards each. Difficulty 1–3.
- Deck draws prefer **unseen** cards, easier first — the player "warms up"
  before the harder asks. Random within the same difficulty band so two
  players don't see identical sequences.
- No timers, no Page Visibility API, no photo proof. We deliberately picked
  the lowest-friction approach so the user feels the game is *encouraging*
  not *policing* — that's load-bearing for the non-stigmatising tone.
- Cards live in a typed config (`src/lib/challenges/cards.ts`); copy is
  i18n-keyed so FR (primary) and EN both work end to end.

## Why honor system

- A school-age user who wants to game the honor system is going to do that
  no matter what we build. Adding tracking turns the game adversarial.
- The score is for *the player*, not the teacher dashboard. Aggregated
  numbers go to the dashboard but only as cohort-level signal ("82% of the
  class drew at least 3 cards"), never individual-level.
- Faster to ship — the rest of Week 3/4 budget stays available for Vercel
  polish and dashboard work.

## Database

Single new table — `challenge_attempts` — applied via migration
`003_challenges.sql`. RLS-enabled, scoped to `current_teacher_school_id()`
just like `survey_responses`. Service-role inserts via the existing
`createAdminClient` pattern.

## Pillar coverage

| Pillar | How |
|---|---|
| Innovation | Inverts the genre — game is the *off-ramp* from the screen, not another screen activity. |
| Smartphone | First mini-game that uses the phone *to leave* the phone. Strong demo moment for SOUK. |
| Addiction | Practical contra-tool, not a "stop using phones" lecture. Reframes screen-down moments as wins. |
| Collaboration | Aggregated by class for the teacher dashboard (W4). |
| Accessible | Pure text + emoji — no audio dependency, no fine motor required, screen-reader friendly. |
| Durable | No external services; deck is open-source content under repo licence. |
| Interdisciplinaire | Card categories draw on UX, behavioural science, mindfulness practice. |

## Files this decision creates / changes

- New: `supabase/migrations/003_challenges.sql` (applied via MCP)
- New: `src/lib/challenges/cards.ts` (30-card typed deck)
- New: `src/lib/challenges/state.ts` (`getChallengeStats`, `pickNextCard`)
- New: `src/app/api/challenges/log/route.ts` (POST attempt outcome)
- New: `src/app/api/challenges/next/route.ts` (GET next card)
- New: `src/app/[locale]/jeu/page.tsx` (route entry)
- New: `src/components/challenges/Game.tsx` (engine UI)
- Updated: `src/types/supabase.ts` (regenerated for migration 003)
- Updated: `src/components/landing/hero.tsx` (secondary CTA → /jeu)
- Updated: `messages/fr.json` + `messages/en.json` (challenges namespace, 30 card titles + bodies in both)

## TODO before SOUK

- [ ] Pilot the deck with 3 HEFP classmates — note any cards that feel
  awkward, judgemental, or culturally off; tweak text in
  `messages/fr.json`.
- [ ] Add cohort-level metrics to the teacher dashboard (W4):
  draws, completion rate, most-skipped card.
- [ ] Consider locale-aware route name: `/jeu` for FR, `/game` for EN —
  needs `pathnames` in `routing.ts` (next-intl). Cosmetic, not blocking.

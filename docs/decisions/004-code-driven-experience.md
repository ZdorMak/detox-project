# ADR 004 — Interactive experience as code-driven scene, not video file

**Date:** 2026-04-23
**Status:** Accepted (W3)

## Context

The Detox Project's "interactive video" is one of the seven pillars
(Innovation) and a load-bearing piece of the SOUK 2026-05-27 demo. Two paths
were on the table:

1. Produce 3-5 min of real video (filmed or text-to-video via Runway/Pika),
   host on Supabase Storage / Vercel Blob / Mux, and overlay branching
   choice UI on top of an HTML5 player.
2. Code-driven scene: typed narration + Lottie animations + Framer Motion
   transitions, branching managed via React state.

## Decision

Path **(2)** — code-driven scene.

## Why

- **Solo dev, 5-week clock.** Filming + voiceover + edit is realistically
  3-5 days of *Maksym's* time we don't have. Path 2 is buildable in 1
  session of agent work.
- **Mobile bandwidth in school networks.** Video paths weigh 30-50 MB even
  at 720p × 2 minutes. Lottie files are ~50 KB each; whole experience fits
  under 250 KB total.
- **Real branching, not video-overlay hacks.** Mp4 + jumpTo is fragile on
  iOS Safari and breaks on slow connections. React state is deterministic.
- **WCAG 2.1 AA is *much* easier without video.** Narration is text from
  the start (screen reader friendly), no VTT subtitle authoring, no audio
  description track required.
- **No external paid services.** Path 1 needs at minimum Mux or a Runway
  subscription. Path 2 uses only assets we ship in `public/` — no
  recurring cost, no third-party SLA risk on demo day.
- **Pillar fit.** "Innovation" reads stronger as "we built a real
  interactive narrative engine" than "we filmed a video and added
  buttons." Jurors at SOUK have seen the latter many times.
- **A/V quality on demo day.** The HEFP venue Wi-Fi is unknown and may be
  flaky. A 250 KB experience cached after first frame is bulletproof; a
  30 MB video stream may stutter live in front of jurors.

## Trade-offs accepted

- Less "cinematic feel" than real video. We compensate with strong
  typography, paced narration, and curated Lottie that have a hand-drawn
  warmth.
- Voiceover is best-effort: Web Speech API by default (free, varies by
  browser), with a path to ElevenLabs FR Bella ($5/mo) for production
  polish if pilot users find the synthesised voice off-putting.

## Storage

**None needed.** The follow-up decision (see "Visual asset addendum"
below) chose inline SVG over Lottie file assets, so the experience ships
entirely in the JS bundle. The Vercel Storage MCP scoped issue (no team)
becomes moot.

Audio (optional VO) would still go to `public/audio/*.mp3` and ride
Vercel's static CDN if we add it.

## Visual asset addendum (decided same day, 2026-04-23)

After scaffolding `SceneVisual.tsx` with `@lottiefiles/dotlottie-react`,
we discovered LottieFiles is on the agent's network blocklist *and* the
in-place agent cannot upload binary assets to the repo's `public/`
folder. Two viable resolutions:

- (a) Maksym manually downloads 5 `.lottie` files from LottieFiles into
  `public/animations/`. Adds 1-2 days of asset curation.
- (b) Hand-author 5 SVG compositions inline in `SceneVisual.tsx`,
  driven by Framer Motion that's already in the bundle.

We chose **(b)**. Trade-off:

- ✅ Removes a runtime dependency (`@lottiefiles/dotlottie-react` ~80 KB
  gzip) from the bundle.
- ✅ Visual style stays cohesive across all five scenes — same vector
  language, same palette logic, same motion grammar.
- ✅ Zero extra Maksym-time required to ship.
- ⚠️ Less photoreal than a hand-illustrated Lottie. We compensate with
  strong palettes and motion that *suggests* without literally depicting.
- 🚪 Door open: if a graphic designer joins the project later, swap in
  Lottie at the SceneVisual layer. The scene id contract is unchanged.

## What we keep open for later

- If post-SOUK we want to ship a real video version for richer school
  rollouts, the API contract for `/api/video/event` (W2-5) is identical:
  `event_type: "branch_choice"` with the same metadata shape. We can swap
  the renderer without changing the analytics path or the teacher
  dashboard.

## Files this decision creates / changes

- New: `src/lib/experience/scenes.ts` (typed scene config + branching map)
- New: `src/lib/experience/telemetry.ts` (buffered video event client)
- New: `src/components/experience/Experience.tsx` (the engine)
- New: `src/components/experience/TypedLines.tsx` (narration reveal)
- New: `src/components/experience/SceneVisual.tsx` (5 hand-authored SVG scenes)
- New: `src/app/[locale]/experience/page.tsx` (route)
- Updated: `src/components/landing/hero.tsx` CTA → `/experience` (then `/survey`)
- New dep: `framer-motion` (only)

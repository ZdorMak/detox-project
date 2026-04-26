/**
 * Hero video playlist for the landing page.
 *
 * Each entry is either:
 *   - a path under `public/videos/` (e.g. `/videos/bedroom.mp4`) — preferred,
 *     hosted on Vercel's CDN, no external dependency
 *   - an absolute URL (e.g. Pexels CDN) — works but adds an external request
 *
 * The playlist auto-rotates every `displayMs` ms with a crossfade.
 * Empty array → falls back to the animated SVG (HeroSvgFallback).
 *
 * Filenames with spaces / capitals are OK — `HeroVideo.tsx` runs them
 * through `encodeURI` before they go into the <video src>. Renaming to
 * snake_case is recommended long-term but not required.
 */

export interface HeroVideoClip {
  /** URL or path to the video file (raw, will be URL-encoded by the player). */
  src: string;
  /** Optional poster image shown until the video loads. */
  poster?: string;
  /** ms this clip is on screen before crossfade. Defaults to 8000. */
  displayMs?: number;
}

export const HERO_PLAYLIST: readonly HeroVideoClip[] = [
  {
    // Phone scroll at night — the "before"
    src: "/videos/A girl is scrolling through her phone at night with the road in the background.mp4",
    displayMs: 8000,
  },
  {
    // Looking out the window — the pause
    src: "/videos/A man looks out the window at the city at night.mp4",
    displayMs: 8000,
  },
  {
    // Friends with phone interruption — the social cost
    src: "/videos/Two young men on bicycles are talking, and one of them takes out his phone.mp4",
    displayMs: 9000,
  },
  {
    // Morning routine — the "after"
    src: "/videos/A man is pouring hot coffee in the kitchen.mp4",
    displayMs: 7000,
  },
  {
    // Nature walk — the reward
    src: "/videos/A girl walking with her dog in an autumn forest.mp4",
    displayMs: 9000,
  },
];

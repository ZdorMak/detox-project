/**
 * Hero video playlist for the landing page.
 *
 * Each entry is either:
 *   - a path under `public/videos/` (e.g. `/videos/bedroom.mp4`) — preferred,
 *     hosted on Vercel's CDN, no external dependency
 *   - an absolute URL (e.g. Pexels CDN) — works but adds an external request
 *
 * The playlist auto-rotates every `displayMs` milliseconds with a crossfade.
 * If the array is empty, the hero falls back to an animated SVG (HeroSvgFallback).
 *
 * To populate (5 minutes of work):
 *   1. Go to https://www.pexels.com/videos/ — searches recommended below.
 *   2. Pick 3-4 vertical-friendly clips (16:9 or 9:16, 5-15 sec each).
 *   3. Click a video → "Free Download" button → choose 1080p or 4K MP4.
 *   4. Save files into `public/videos/` (e.g. `bedroom.mp4`, `window.mp4`).
 *   5. Replace the empty array below with `{ src: "/videos/bedroom.mp4", ... }`.
 *
 * Recommended Pexels searches (filter: "Videos"):
 *   - "teenager phone night"   → bedroom desk + lit phone
 *   - "looking out window"     → contemplative pause
 *   - "two friends talking"    → human connection
 *   - "morning routine"        → sky / coffee / start of day
 *   - "city walk"              → outside, fresh air
 *
 * Pexels licence allows free commercial use, no attribution required.
 */

export interface HeroVideoClip {
  /** URL or path to the video file. */
  src: string;
  /** Optional poster image shown until the video loads. */
  poster?: string;
  /** ms this clip is on screen before crossfade to next. Defaults to 8000. */
  displayMs?: number;
}

export const HERO_PLAYLIST: readonly HeroVideoClip[] = [
  // Add clips here, e.g.:
  // { src: "/videos/bedroom.mp4", displayMs: 8000 },
  // { src: "/videos/window.mp4", displayMs: 8000 },
  // { src: "/videos/talking.mp4", displayMs: 8000 },
];

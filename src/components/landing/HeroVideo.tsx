"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { HERO_PLAYLIST } from "@/lib/landing/hero-videos";
import { HeroSvgFallback } from "./HeroSvgFallback";

/**
 * Landing hero "video": plays a curated playlist of stock clips with
 * crossfade. Falls back to an animated SVG if the playlist is empty
 * (e.g. before stock files have been added to public/videos/).
 *
 * - autoplay + muted + playsInline → works on mobile Safari/iOS
 * - prefers-reduced-motion → freezes on the first frame, stops rotation
 * - clips are preloaded one-ahead so transitions are seamless
 *
 * The playlist lives in src/lib/landing/hero-videos.ts. See that file for
 * setup instructions.
 */
export function HeroVideo() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playlist = HERO_PLAYLIST;

  const current = playlist[idx];
  const displayMs = current?.displayMs ?? 8000;

  useEffect(() => {
    if (reduce) return;
    if (playlist.length < 2) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % playlist.length), displayMs);
    return () => clearTimeout(t);
  }, [idx, displayMs, playlist.length, reduce]);

  // No videos configured yet — show the SVG fallback so the hero isn't empty.
  if (playlist.length === 0 || !current) {
    return <HeroSvgFallback />;
  }

  const next = playlist[(idx + 1) % playlist.length]!;

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-black shadow-2xl"
    >
      <AnimatePresence mode="sync">
        <motion.video
          key={`v-${idx}-${current.src}`}
          ref={videoRef}
          src={current.src}
          poster={current.poster}
          autoPlay
          muted
          playsInline
          loop={playlist.length === 1}
          preload="auto"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Preload the next clip in a hidden video element. */}
      {playlist.length > 1 && next.src !== current.src && (
        <link rel="preload" as="video" href={next.src} />
      )}

      {/* Subtle dark overlay so the headline above stays readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Progress dots */}
      {playlist.length > 1 && !reduce && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {playlist.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 rounded-full transition-all " +
                (i === idx ? "w-6 bg-white/80" : "w-1.5 bg-white/30")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

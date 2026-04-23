"use client";

import { useEffect, useRef, useState } from "react";

interface TypedLinesProps {
  /** Pre-translated narration lines for the active scene. */
  lines: readonly string[];
  /** Approx. ms each line stays on screen before the next appears. */
  msPerLine: number;
  /** Fired once after the final line has been on screen for `msPerLine`. */
  onComplete: () => void;
  /** Reduced-motion users see the full text instantly without typing animation. */
  reduceMotion: boolean;
}

/**
 * Reveals narration lines one at a time. After the final line finishes,
 * waits `msPerLine` then calls `onComplete`. Honours `prefers-reduced-motion`.
 *
 * Renders into an aria-live="polite" region so screen readers announce
 * each new line without yanking focus.
 */
export function TypedLines({
  lines,
  msPerLine,
  onComplete,
  reduceMotion,
}: TypedLinesProps) {
  const [shownCount, setShownCount] = useState(reduceMotion ? lines.length : 0);
  const completedRef = useRef(false);

  // Reset when the lines array identity changes (= scene change).
  useEffect(() => {
    completedRef.current = false;
    setShownCount(reduceMotion ? lines.length : 0);
  }, [lines, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      // For reduced-motion: just hold final state for `msPerLine` then complete.
      const t = setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }, msPerLine);
      return () => clearTimeout(t);
    }

    if (shownCount < lines.length) {
      const t = setTimeout(() => setShownCount((n) => n + 1), msPerLine);
      return () => clearTimeout(t);
    }

    // All lines visible — wait one more beat and then complete.
    const t = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, msPerLine);
    return () => clearTimeout(t);
  }, [shownCount, lines.length, msPerLine, onComplete, reduceMotion]);

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Narration"
      className="space-y-3"
    >
      {lines.map((line, i) => (
        <p
          key={i}
          className={
            "text-balance text-lg leading-relaxed transition-all duration-700 sm:text-xl md:text-2xl " +
            (i < shownCount
              ? "opacity-100 translate-y-0"
              : "pointer-events-none select-none opacity-0 translate-y-2")
          }
          aria-hidden={i >= shownCount ? true : undefined}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

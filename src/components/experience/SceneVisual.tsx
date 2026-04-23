"use client";

import { useEffect, useRef, useState } from "react";

interface SceneVisualProps {
  /**
   * Lottie file name under `public/animations/`. If the file is absent
   * (Lottie assets are deferred — see storyboard TODO), we fall back to a
   * pleasant gradient placeholder so the UX still works end-to-end.
   */
  lottieFile?: string;
  /** Used in the placeholder gradient + as ARIA label hint. */
  sceneId: string;
  /** When true, freeze on the first frame (prefers-reduced-motion). */
  reduceMotion: boolean;
}

/**
 * Decorative scene visual. Loads the Lottie player lazily on the client to
 * keep the initial bundle small. If the file is missing or fails to load,
 * silently falls back to a hashed-color gradient.
 *
 * Always `aria-hidden="true"` — narration is the source of truth for AT.
 */
export function SceneVisual({ lottieFile, sceneId, reduceMotion }: SceneVisualProps) {
  const [Player, setPlayer] = useState<React.ComponentType<{
    src: string;
    autoplay?: boolean;
    loop?: boolean;
    speed?: number;
    style?: React.CSSProperties;
  }> | null>(null);
  const [lottieFailed, setLottieFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lottieFile) return;
    let cancelled = false;
    void import("@lottiefiles/dotlottie-react")
      .then((mod) => {
        if (!cancelled) setPlayer(() => mod.DotLottieReact);
      })
      .catch((err) => {
        console.warn("[experience/visual] failed to load Lottie player:", err);
        if (!cancelled) setLottieFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lottieFile]);

  const showLottie = lottieFile && Player && !lottieFailed;
  const src = lottieFile ? `/animations/${lottieFile}` : "";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative mx-auto flex aspect-[16/10] w-full max-w-2xl items-center justify-center overflow-hidden rounded-xl"
      style={{ background: gradientForScene(sceneId) }}
    >
      {showLottie && Player && (
        <Player
          src={src}
          autoplay={!reduceMotion}
          loop
          speed={reduceMotion ? 0 : 1}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}

/**
 * Deterministic gradient per scene id — gives each step a distinct mood
 * even when the Lottie isn't loaded yet (placeholder phase).
 */
function gradientForScene(sceneId: string): string {
  const palettes: Record<string, [string, string]> = {
    evening_room: ["#1e293b", "#312e81"], // slate -> indigo
    rabbit_hole: ["#3b0764", "#7c2d12"], // purple -> orange
    silence: ["#0f766e", "#1e293b"], // teal -> slate
    shared_screen: ["#7c2d12", "#0f172a"], // orange -> almost-black
    listening: ["#0c4a6e", "#155e75"], // sky -> cyan
    closing: ["#0f172a", "#1e3a8a"], // slate -> blue
    choice_1: ["#312e81", "#1e293b"],
    choice_2: ["#1e3a8a", "#312e81"],
  };
  const [a, b] = palettes[sceneId] ?? ["#1e293b", "#0f172a"];
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}

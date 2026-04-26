"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/**
 * Code-driven "video" for the landing hero — a 25-second looping ambient
 * SVG animation. Same philosophy as `/experience` scenes (ADR-004): no
 * external assets, no bandwidth cost, full Tailwind theming, AT-friendly
 * (decorative only, the real headline lives next to it).
 *
 * The scene cycles through 4 vignettes:
 *   1. Phone vibrating on a desk at night (notifications pulsing)
 *   2. Hand putting phone face-down
 *   3. Person at the window, sky lights breathing
 *   4. Two silhouettes facing each other (the "listen" scene)
 *
 * Honours `prefers-reduced-motion` — collapses to a static frame and stops cycling.
 */

const SCENE_MS = 6_000;
const SCENES = ["phone_buzz", "phone_down", "window", "talking"] as const;
type Scene = (typeof SCENES)[number];

export function HeroVideo() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SCENES.length), SCENE_MS);
    return () => clearInterval(t);
  }, [reduce]);

  const scene: Scene = SCENES[idx]!;

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-2xl border border-border shadow-2xl"
      style={{ background: gradientForScene(scene) }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <svg
            viewBox="0 0 800 450"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full"
          >
            {renderScene(scene, reduce ?? false)}
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* Subtle progress dots */}
      {!reduce && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {SCENES.map((s, i) => (
            <span
              key={s}
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

/* ---------- scene renderers ---------- */

function renderScene(scene: Scene, reduce: boolean): React.ReactNode {
  switch (scene) {
    case "phone_buzz":
      return <PhoneBuzz reduce={reduce} />;
    case "phone_down":
      return <PhoneDown reduce={reduce} />;
    case "window":
      return <Window reduce={reduce} />;
    case "talking":
      return <Talking reduce={reduce} />;
  }
}

function gradientForScene(scene: Scene): string {
  switch (scene) {
    case "phone_buzz":
      return "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)";
    case "phone_down":
      return "linear-gradient(135deg, #134e4a 0%, #0f172a 100%)";
    case "window":
      return "linear-gradient(135deg, #075985 0%, #155e75 100%)";
    case "talking":
      return "linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 100%)";
  }
}

function PhoneBuzz({ reduce }: { reduce: boolean }) {
  const shake = reduce
    ? undefined
    : { x: [0, -2, 2, -2, 2, 0], y: [0, 1, -1, 1, -1, 0] };
  return (
    <g>
      <defs>
        <radialGradient id="lamp" cx="20%" cy="30%" r="40%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="150" rx="220" ry="160" fill="url(#lamp)" />
      <rect x="60" y="320" width="680" height="130" fill="#1e1b4b" opacity="0.85" />
      <line x1="60" y1="320" x2="740" y2="320" stroke="#fbbf24" strokeOpacity="0.3" strokeWidth="2" />

      {/* Open book */}
      <g transform="translate(150, 240)">
        <rect x="0" y="0" width="180" height="80" fill="#f3f4f6" opacity="0.85" />
        <line x1="90" y1="0" x2="90" y2="80" stroke="#1e1b4b" strokeWidth="1" opacity="0.5" />
        {[20, 35, 50].map((y) => (
          <line key={y} x1="10" y1={y} x2="80" y2={y} stroke="#1e1b4b" strokeWidth="2" opacity="0.6" />
        ))}
        {[20, 35, 50].map((y) => (
          <line key={y} x1="100" y1={y} x2="170" y2={y} stroke="#1e1b4b" strokeWidth="2" opacity="0.6" />
        ))}
      </g>

      {/* Vibrating phone */}
      <motion.g
        transform="translate(500, 270)"
        initial={{ rotate: 0 }}
        animate={shake}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
      >
        <rect x="0" y="0" width="60" height="105" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        <rect x="4" y="8" width="52" height="89" rx="6" fill="#1e293b" />
        <motion.circle
          cx="30"
          cy="-18"
          r="11"
          fill="#ef4444"
          initial={{ scale: 0.8, opacity: 0.4 }}
          animate={reduce ? undefined : { scale: [0.8, 1.5, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <text x="30" y="-13" textAnchor="middle" fontSize="12" fill="#ffffff" fontFamily="system-ui" fontWeight="bold">
          5
        </text>
      </motion.g>
    </g>
  );
}

function PhoneDown({ reduce }: { reduce: boolean }) {
  return (
    <g>
      <defs>
        <radialGradient id="warm" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.ellipse
        cx="400"
        cy="220"
        rx="320"
        ry="180"
        fill="url(#warm)"
        initial={{ opacity: 0.7 }}
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      {/* Hand */}
      <g transform="translate(400, 200)">
        <ellipse cx="0" cy="0" rx="80" ry="35" fill="#fda4af" opacity="0.9" />
        <rect x="-30" y="-5" width="60" height="50" rx="20" fill="#fda4af" opacity="0.9" />
      </g>
      {/* Phone face-down */}
      <motion.g
        transform="translate(360, 240)"
        initial={{ y: -20, rotate: 12 }}
        animate={reduce ? undefined : { y: [-20, 5, 0], rotate: [12, 0] }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <rect x="0" y="0" width="80" height="50" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
      </motion.g>
      <line x1="60" y1="320" x2="740" y2="320" stroke="#5eead4" strokeOpacity="0.3" strokeWidth="2" />
    </g>
  );
}

function Window({ reduce }: { reduce: boolean }) {
  return (
    <g>
      {/* Window frame */}
      <rect x="180" y="80" width="440" height="320" fill="#0c4a6e" stroke="#7dd3fc" strokeWidth="3" />
      <line x1="400" y1="80" x2="400" y2="400" stroke="#7dd3fc" strokeWidth="2" opacity="0.6" />
      <line x1="180" y1="240" x2="620" y2="240" stroke="#7dd3fc" strokeWidth="2" opacity="0.6" />

      {/* Sky inside */}
      <rect x="183" y="83" width="434" height="314" fill="#0369a1" />

      {/* Stars */}
      {[
        { cx: 250, cy: 130, delay: 0 },
        { cx: 340, cy: 110, delay: 0.6 },
        { cx: 470, cy: 170, delay: 1.2 },
        { cx: 540, cy: 130, delay: 0.3 },
        { cx: 280, cy: 290, delay: 1.8 },
        { cx: 540, cy: 320, delay: 0.9 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r="2"
          fill="#fde68a"
          initial={{ opacity: 0.3 }}
          animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: s.delay }}
        />
      ))}

      {/* Person silhouette in front of window */}
      <g transform="translate(360, 280)">
        <circle cx="40" cy="40" r="38" fill="#0f172a" />
        <path d="M -10 200 Q 40 90 90 200 Z" fill="#0f172a" />
      </g>
    </g>
  );
}

function Talking({ reduce }: { reduce: boolean }) {
  return (
    <g>
      <g transform="translate(180, 120)">
        <circle cx="60" cy="60" r="55" fill="#0f172a" />
        <path d="M 0 320 Q 60 130 120 320 Z" fill="#0f172a" />
      </g>
      <g transform="translate(500, 120)">
        <circle cx="60" cy="60" r="55" fill="#0f172a" />
        <path d="M 0 320 Q 60 130 120 320 Z" fill="#0f172a" />
      </g>

      <defs>
        <radialGradient id="empathy-hero" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.circle
        cx="400"
        cy="200"
        r="90"
        fill="url(#empathy-hero)"
        initial={{ scale: 0.85, opacity: 0.5 }}
        animate={reduce ? undefined : { scale: [0.85, 1.25, 0.85], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </g>
  );
}

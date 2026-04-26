"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/**
 * Fallback hero "video" — animated SVG, used until real stock clips
 * are added under public/videos/. Same 4-vignette concept as before;
 * it's intentionally minimalist because the real cinematic content is
 * supposed to come from MP4 stock.
 */

const SCENE_MS = 6_000;
const SCENES = ["phone_buzz", "phone_down", "window", "talking"] as const;
type Scene = (typeof SCENES)[number];

export function HeroSvgFallback() {
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
          <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
            {renderScene(scene, reduce ?? false)}
          </svg>
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        Placeholder · add stock clips to public/videos/
      </div>
    </div>
  );
}

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
  return (
    <g>
      <defs>
        <radialGradient id="lampF" cx="20%" cy="30%" r="40%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="150" rx="220" ry="160" fill="url(#lampF)" />
      <rect x="60" y="320" width="680" height="130" fill="#1e1b4b" opacity="0.85" />
      <motion.g
        transform="translate(500, 270)"
        initial={{ rotate: 0 }}
        animate={reduce ? undefined : { x: [0, -2, 2, -2, 2, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
      >
        <rect x="0" y="0" width="60" height="105" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        <motion.circle
          cx="30"
          cy="-18"
          r="11"
          fill="#ef4444"
          animate={reduce ? undefined : { scale: [0.8, 1.5, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </motion.g>
    </g>
  );
}

function PhoneDown({ reduce }: { reduce: boolean }) {
  return (
    <g>
      <defs>
        <radialGradient id="warmF" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.ellipse
        cx="400"
        cy="220"
        rx="320"
        ry="180"
        fill="url(#warmF)"
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <g transform="translate(360, 240)">
        <rect x="0" y="0" width="80" height="50" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
      </g>
    </g>
  );
}

function Window({ reduce }: { reduce: boolean }) {
  return (
    <g>
      <rect x="180" y="80" width="440" height="320" fill="#0c4a6e" stroke="#7dd3fc" strokeWidth="3" />
      <line x1="400" y1="80" x2="400" y2="400" stroke="#7dd3fc" strokeWidth="2" opacity="0.6" />
      <line x1="180" y1="240" x2="620" y2="240" stroke="#7dd3fc" strokeWidth="2" opacity="0.6" />
      <rect x="183" y="83" width="434" height="314" fill="#0369a1" />
      {[
        { cx: 250, cy: 130, delay: 0 },
        { cx: 340, cy: 110, delay: 0.6 },
        { cx: 470, cy: 170, delay: 1.2 },
        { cx: 540, cy: 130, delay: 0.3 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r="2"
          fill="#fde68a"
          animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: s.delay }}
        />
      ))}
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
        <radialGradient id="empathyF" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.circle
        cx="400"
        cy="200"
        r="90"
        fill="url(#empathyF)"
        animate={reduce ? undefined : { scale: [0.85, 1.25, 0.85], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </g>
  );
}

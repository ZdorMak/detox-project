"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SceneVisualProps {
  /** Scene id from scenes.ts — picks the right SVG composition. */
  sceneId: string;
}

/**
 * Decorative scene visual — pure SVG + Framer Motion. No external assets.
 *
 * Each scene has a distinct mood expressed through palette + motion:
 *   - evening_room: cool indigo, pulsing phone amid quiet desk
 *   - rabbit_hole:  warm orange, infinite scrolling cards
 *   - silence:      teal, breathing book glow, phone face-down
 *   - shared_screen: orange-on-dark, three silhouettes around glowing phone
 *   - listening:    sky blue, two silhouettes with empathetic pulse between them
 *   - choice_*:     neutral gradient, no decoration (the prompt is the visual)
 *   - closing:      deep blue gradient with subtle starburst
 *
 * Always `aria-hidden="true"` — narration carries the meaning for AT.
 * Honours `prefers-reduced-motion` automatically via Framer Motion.
 */
export function SceneVisual({ sceneId }: SceneVisualProps) {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[16/10] w-full max-w-2xl overflow-hidden rounded-xl"
      style={{ background: gradientForScene(sceneId) }}
    >
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        {renderScene(sceneId)}
      </svg>
    </div>
  );
}

function renderScene(sceneId: string): React.ReactNode {
  switch (sceneId) {
    case "evening_room":
      return <EveningRoom />;
    case "rabbit_hole":
      return <RabbitHole />;
    case "silence":
      return <Silence />;
    case "shared_screen":
      return <SharedScreen />;
    case "listening":
      return <Listening />;
    case "closing":
      return <Closing />;
    default:
      return null; // choice screens stay as plain gradient
  }
}

function gradientForScene(sceneId: string): string {
  const palettes: Record<string, [string, string]> = {
    evening_room: ["#1e1b4b", "#312e81"],
    rabbit_hole: ["#3b0764", "#9a3412"],
    silence: ["#134e4a", "#0f172a"],
    shared_screen: ["#7c2d12", "#0c0a09"],
    listening: ["#075985", "#155e75"],
    closing: ["#0f172a", "#1e3a8a"],
    choice_1: ["#312e81", "#1e293b"],
    choice_2: ["#1e3a8a", "#312e81"],
  };
  const [a, b] = palettes[sceneId] ?? ["#1e293b", "#0f172a"];
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}

/* ---------- Scene compositions ---------- */

function EveningRoom() {
  const reduce = useReducedMotion();
  return (
    <g>
      {/* Lamp glow */}
      <defs>
        <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="280" rx="220" ry="160" fill="url(#lamp-glow)" />

      {/* Desk surface */}
      <rect x="80" y="350" width="640" height="140" fill="#1e1b4b" opacity="0.8" />
      <line x1="80" y1="350" x2="720" y2="350" stroke="#fbbf24" strokeOpacity="0.3" strokeWidth="2" />

      {/* Open book */}
      <g transform="translate(220, 290)">
        <path d="M 0 60 L 0 0 L 80 0 L 80 60 Z" fill="#f3f4f6" opacity="0.9" />
        <path d="M 80 60 L 80 0 L 160 0 L 160 60 Z" fill="#e5e7eb" opacity="0.9" />
        <line x1="20" y1="20" x2="60" y2="20" stroke="#1e1b4b" strokeWidth="2" opacity="0.6" />
        <line x1="20" y1="32" x2="65" y2="32" stroke="#1e1b4b" strokeWidth="2" opacity="0.6" />
        <line x1="20" y1="44" x2="55" y2="44" stroke="#1e1b4b" strokeWidth="2" opacity="0.6" />
        <line x1="100" y1="20" x2="140" y2="20" stroke="#1e1b4b" strokeWidth="2" opacity="0.6" />
        <line x1="100" y1="32" x2="145" y2="32" stroke="#1e1b4b" strokeWidth="2" opacity="0.6" />
      </g>

      {/* Lamp */}
      <g transform="translate(160, 130)">
        <line x1="40" y1="160" x2="40" y2="220" stroke="#92400e" strokeWidth="4" />
        <path d="M 0 160 L 80 160 L 60 100 L 20 100 Z" fill="#fbbf24" />
        <ellipse cx="40" cy="100" rx="20" ry="6" fill="#92400e" />
      </g>

      {/* Phone with pulsing notification */}
      <g transform="translate(520, 380)">
        <rect x="0" y="0" width="50" height="90" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        <rect x="3" y="6" width="44" height="78" rx="4" fill="#1e293b" />
        <motion.circle
          cx="25"
          cy="-15"
          r="10"
          fill="#ef4444"
          initial={{ scale: 0.8, opacity: 0.3 }}
          animate={reduce ? undefined : { scale: [0.8, 1.4, 0.8], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <text x="25" y="-11" textAnchor="middle" fontSize="11" fill="#ffffff" fontFamily="system-ui" fontWeight="bold">
          3
        </text>
      </g>
    </g>
  );
}

function RabbitHole() {
  const reduce = useReducedMotion();
  const cards = Array.from({ length: 6 }, (_, i) => i);
  return (
    <g>
      {/* Phone frame */}
      <rect x="270" y="40" width="260" height="420" rx="28" fill="#0c0a09" stroke="#fb923c" strokeWidth="3" />
      <rect x="282" y="60" width="236" height="380" rx="14" fill="#1c1917" />

      {/* Scrolling feed */}
      <defs>
        <clipPath id="feed-clip">
          <rect x="282" y="60" width="236" height="380" rx="14" />
        </clipPath>
      </defs>
      <g clipPath="url(#feed-clip)">
        <motion.g
          initial={{ y: 0 }}
          animate={reduce ? undefined : { y: [-0, -360, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          {cards.map((i) => (
            <g key={i} transform={`translate(298, ${80 + i * 110})`}>
              <rect x="0" y="0" width="204" height="92" rx="8" fill="#292524" />
              <rect x="8" y="8" width="40" height="40" rx="20" fill="#fb923c" opacity="0.7" />
              <rect x="56" y="14" width="80" height="8" rx="4" fill="#fde68a" opacity="0.7" />
              <rect x="56" y="28" width="120" height="6" rx="3" fill="#a8a29e" opacity="0.5" />
              <rect x="8" y="60" width="188" height="22" rx="4" fill="#44403c" />
            </g>
          ))}
        </motion.g>
      </g>

      {/* Time stamp tick */}
      <motion.text
        x="130"
        y="80"
        fontSize="32"
        fontFamily="system-ui"
        fontWeight="700"
        fill="#fde68a"
        opacity="0.9"
        initial={{ opacity: 0.7 }}
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        20:47
      </motion.text>
      <motion.text
        x="130"
        y="120"
        fontSize="14"
        fontFamily="system-ui"
        fill="#fb923c"
        opacity="0.6"
        initial={{ opacity: 0 }}
        animate={reduce ? undefined : { opacity: [0, 0.6, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
      >
        → 22:13
      </motion.text>

      {/* Faded book in corner */}
      <g transform="translate(620, 380)" opacity="0.25">
        <rect x="0" y="0" width="100" height="70" fill="#f3f4f6" />
        <line x1="50" y1="0" x2="50" y2="70" stroke="#1e1b4b" strokeWidth="1" />
      </g>
    </g>
  );
}

function Silence() {
  const reduce = useReducedMotion();
  return (
    <g>
      {/* Warm focused light */}
      <defs>
        <radialGradient id="focus-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.ellipse
        cx="400"
        cy="200"
        rx="320"
        ry="200"
        fill="url(#focus-glow)"
        initial={{ opacity: 0.7 }}
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Open book centered */}
      <g transform="translate(280, 220)">
        <path d="M 0 100 L 0 0 L 120 0 L 120 100 Z" fill="#fef3c7" />
        <path d="M 120 100 L 120 0 L 240 0 L 240 100 Z" fill="#fde68a" />
        <line x1="120" y1="0" x2="120" y2="100" stroke="#92400e" strokeWidth="1" opacity="0.4" />
        {[18, 32, 46, 60, 74].map((y) => (
          <line key={y} x1="20" y1={y} x2={y < 50 ? 100 : 90} y2={y} stroke="#1e293b" strokeWidth="2" opacity="0.5" />
        ))}
        {[18, 32, 46, 60, 74].map((y) => (
          <line key={y} x1="140" y1={y} x2={y < 50 ? 220 : 210} y2={y} stroke="#1e293b" strokeWidth="2" opacity="0.5" />
        ))}
      </g>

      {/* Pen */}
      <g transform="translate(380, 350) rotate(20)">
        <rect x="0" y="0" width="80" height="6" fill="#1e293b" />
        <polygon points="80,0 90,3 80,6" fill="#5eead4" />
      </g>

      {/* Phone face-down (just a dark rectangle) */}
      <g transform="translate(580, 380)">
        <rect x="0" y="0" width="80" height="50" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      </g>
    </g>
  );
}

function SharedScreen() {
  const reduce = useReducedMotion();
  return (
    <g>
      {/* Floor / context */}
      <line x1="0" y1="450" x2="800" y2="450" stroke="#fb923c" strokeWidth="1" opacity="0.3" />

      {/* Phone in middle, glowing */}
      <g transform="translate(370, 220)">
        <motion.rect
          x="-5"
          y="-5"
          width="70"
          height="110"
          rx="14"
          fill="#fb923c"
          opacity="0.5"
          initial={{ opacity: 0.4 }}
          animate={reduce ? undefined : { opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <rect x="0" y="0" width="60" height="100" rx="10" fill="#1c1917" />
        <rect x="4" y="8" width="52" height="84" rx="6" fill="#fde68a" />
      </g>

      {/* Three silhouettes facing the phone */}
      {/* Left */}
      <g transform="translate(180, 200)" opacity="0.85">
        <circle cx="40" cy="40" r="32" fill="#0c0a09" />
        <path d="M 0 200 Q 40 80 80 200 Z" fill="#0c0a09" />
      </g>
      {/* Center back */}
      <g transform="translate(360, 320)" opacity="0.7">
        <circle cx="40" cy="40" r="36" fill="#0c0a09" />
        <path d="M -10 220 Q 40 80 90 220 Z" fill="#0c0a09" />
      </g>
      {/* Right */}
      <g transform="translate(540, 200)" opacity="0.85">
        <circle cx="40" cy="40" r="32" fill="#0c0a09" />
        <path d="M 0 200 Q 40 80 80 200 Z" fill="#0c0a09" />
      </g>
    </g>
  );
}

function Listening() {
  const reduce = useReducedMotion();
  return (
    <g>
      {/* Two silhouettes facing each other */}
      <g transform="translate(180, 180)">
        <circle cx="60" cy="60" r="50" fill="#0c0a09" />
        <path d="M 0 280 Q 60 110 120 280 Z" fill="#0c0a09" />
      </g>
      <g transform="translate(500, 180)">
        <circle cx="60" cy="60" r="50" fill="#0c0a09" />
        <path d="M 0 280 Q 60 110 120 280 Z" fill="#0c0a09" />
      </g>

      {/* Empathetic pulse between them */}
      <defs>
        <radialGradient id="empathy" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.circle
        cx="400"
        cy="240"
        r="80"
        fill="url(#empathy)"
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={reduce ? undefined : { scale: [0.8, 1.3, 0.8], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Phone in pocket — small dim glow at right silhouette's hip */}
      <motion.circle
        cx="560"
        cy="380"
        r="6"
        fill="#7dd3fc"
        opacity="0.4"
        initial={{ opacity: 0.2 }}
        animate={reduce ? undefined : { opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
      />
    </g>
  );
}

function Closing() {
  const reduce = useReducedMotion();
  const stars = [
    { cx: 150, cy: 120, r: 1.5, delay: 0 },
    { cx: 280, cy: 80, r: 2, delay: 0.5 },
    { cx: 420, cy: 150, r: 1.2, delay: 1.2 },
    { cx: 560, cy: 100, r: 1.8, delay: 0.8 },
    { cx: 680, cy: 180, r: 1.5, delay: 1.6 },
    { cx: 200, cy: 380, r: 1.5, delay: 2 },
    { cx: 600, cy: 360, r: 1.2, delay: 0.3 },
  ];
  return (
    <g>
      {stars.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#e0f2fe"
          initial={{ opacity: 0.3 }}
          animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: s.delay }}
        />
      ))}
      {/* Soft horizon line */}
      <line x1="0" y1="380" x2="800" y2="380" stroke="#7dd3fc" strokeWidth="1" opacity="0.3" />
    </g>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { RiskBand } from "@/lib/survey/sas-sv";

interface ScoreGaugeProps {
  score: number;
  min: number;
  max: number;
  band: RiskBand;
  bandLabel: string;
  scoreLabel: string;
  rangeLabel: string;
}

const BAND_COLORS: Record<RiskBand, { ring: string; text: string; halo: string; from: string; to: string }> = {
  low: {
    ring: "#10b981",
    text: "text-emerald-700 dark:text-emerald-300",
    halo: "rgba(16,185,129,0.25)",
    from: "#10b981",
    to: "#14b8a6",
  },
  moderate: {
    ring: "#f59e0b",
    text: "text-amber-700 dark:text-amber-300",
    halo: "rgba(245,158,11,0.25)",
    from: "#f59e0b",
    to: "#f97316",
  },
  high: {
    ring: "#f43f5e",
    text: "text-rose-700 dark:text-rose-300",
    halo: "rgba(244,63,94,0.25)",
    from: "#f43f5e",
    to: "#e11d48",
  },
};

/**
 * Big circular gauge — animated SVG arc that fills based on the score's
 * position in the SAS-SV range. Centerpiece of the results page.
 *
 * - Animated number counter on mount.
 * - Arc fills with a gradient stroke matching the band.
 * - Honours `prefers-reduced-motion`.
 */
export function ScoreGauge({
  score,
  min,
  max,
  band,
  bandLabel,
  scoreLabel,
  rangeLabel,
}: ScoreGaugeProps) {
  const reduce = useReducedMotion();
  const pct = Math.round(((score - min) / (max - min)) * 100);
  const colors = BAND_COLORS[band];
  const [displayed, setDisplayed] = useState(reduce ? score : min);

  useEffect(() => {
    if (reduce) {
      setDisplayed(score);
      return;
    }
    const start = performance.now();
    const duration = 1200;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(min + (score - min) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, min, reduce]);

  // Arc geometry — 280 deg sweep, opens at the bottom.
  const cx = 100;
  const cy = 100;
  const r = 80;
  const startAngle = 130; // degrees
  const endAngle = 410; // 360 + 50
  const sweep = endAngle - startAngle;
  const fillAngle = startAngle + (sweep * pct) / 100;

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Halo glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto h-72 w-72 rounded-full blur-3xl"
        style={{ background: colors.halo }}
      />

      <svg viewBox="0 0 200 200" className="mx-auto h-72 w-72">
        <defs>
          <linearGradient id="gauge-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        {/* Track */}
        <path
          d={describeArc(cx, cy, r, startAngle, endAngle)}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Animated fill */}
        <motion.path
          d={describeArc(cx, cy, r, startAngle, fillAngle)}
          fill="none"
          stroke="url(#gauge-fill)"
          strokeWidth={14}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>

      {/* Centered text overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {scoreLabel}
        </p>
        <p
          className={`font-display mt-1 text-7xl font-bold leading-none tabular-nums ${colors.text}`}
        >
          {displayed}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{rangeLabel}</p>
        <span
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${colors.text}`}
          style={{ background: colors.halo }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: colors.ring }}
            aria-hidden="true"
          />
          {bandLabel}
        </span>
      </div>
    </div>
  );
}

/* SVG arc helpers */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const sweep = endAngle - startAngle;
  const largeArcFlag = sweep <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

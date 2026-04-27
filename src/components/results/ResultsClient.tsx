"use client";

import { useEffect, useState } from "react";

interface ResultsClientProps {
  /** Final integer score 10..60. */
  score: number;
  /** Per-question values 1..6 in question-order. */
  fingerprint: readonly number[];
  cat: "low" | "mid" | "high";
}

/**
 * Animated number + bar fill for the results page. Counts up from 0 to the
 * final score over ~840 ms and triggers the meter / fingerprint reveal.
 */
export function ResultsScoreNumber({ score, cat }: { score: number; cat: ResultsClientProps["cat"] }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let n = 0;
    const target = score;
    const step = Math.max(1, Math.floor(target / 30));
    const id = setInterval(() => {
      n += step;
      if (n >= target) {
        n = target;
        clearInterval(id);
      }
      setShown(n);
    }, 28);
    return () => clearInterval(id);
  }, [score]);
  return <div className={`rs-num cat-${cat}`}>{shown}</div>;
}

/** Vertical fingerprint bars — one per question, height = answer / 6. */
export function ResultsFingerprint({
  fingerprint,
  cat,
}: {
  fingerprint: readonly number[];
  cat: ResultsClientProps["cat"];
}) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="rs-fp-bars">
      {fingerprint.map((v, i) => (
        <div key={i} className="rs-fp-bar" title={`Q${i + 1}: ${v}`}>
          <div
            className={`rs-fp-bar-fill cat-${cat}`}
            style={{ height: revealed ? `${(v / 6) * 100}%` : 0 }}
          />
        </div>
      ))}
    </div>
  );
}

/** Animated meter fill 0..pct% with category color. */
export function ResultsMeter({ pct, cat }: { pct: number; cat: ResultsClientProps["cat"] }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);
  return <div className={`rs-meter-fill cat-${cat}`} style={{ width: `${w}%` }} />;
}

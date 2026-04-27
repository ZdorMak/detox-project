"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SAS_SV_ITEMS, SAS_SV_LIKERT } from "@/lib/survey/sas-sv";
import type { SurveyAnswers } from "@/lib/survey/state";
import { cn } from "@/lib/utils";

interface SurveyClientProps {
  initialAnswers: SurveyAnswers;
  initialNextItemId: number | null;
  resultsHref: string;
}

/**
 * Test screen — direct port of the Claude Design dial slider.
 *
 * - Single question on screen, italic Instrument Serif at clamp 40-64px.
 * - Custom drag-dial below: track + 6 ticks + glowing thumb.
 * - Mouse hover previews the value (display = hover ?? committed); release
 *   commits and auto-advances after 480 ms.
 * - Keyboard 1-6 directly commits, ←/→ navigates between questions.
 * - Atmospheric blob behind everything ramps with the chosen intensity.
 * - Live label morphs with the dial position ("Pas du tout d'accord" → ...
 *   → "Tout à fait d'accord").
 */
export function SurveyClient({
  initialAnswers,
  initialNextItemId,
  resultsHref,
}: SurveyClientProps) {
  const router = useRouter();
  const t = useTranslations("survey");

  const total = SAS_SV_ITEMS.length;
  const initIdx = (() => {
    if (initialNextItemId != null) return initialNextItemId - 1;
    const firstUnanswered = SAS_SV_ITEMS.findIndex((it) => initialAnswers[it.id] === undefined);
    return firstUnanswered === -1 ? total - 1 : firstUnanswered;
  })();

  const [answers, setAnswers] = useState<SurveyAnswers>(initialAnswers);
  const [idx, setIdx] = useState(initIdx);
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  const item = SAS_SV_ITEMS[idx]!;
  const v = answers[item.id];
  const display = hover ?? v ?? null;
  const intensity = display ? display / 6 : 0;

  const liveLabel = display
    ? SAS_SV_LIKERT[display - 1]!.fr
    : t("dialIdle");

  /* --------- Persist + navigate --------- */

  const persistAnswer = useCallback(
    async (itemId: number, value: number) => {
      setAnswers((prev) => ({ ...prev, [itemId]: value }));
      setSavingItemId(itemId);
      try {
        const res = await fetch("/api/survey/answer", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ itemId, value }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        console.error("answer save failed:", err);
      } finally {
        setSavingItemId(null);
      }
    },
    [],
  );

  const commit = useCallback(
    (val: number) => {
      const it = SAS_SV_ITEMS[idx]!;
      void persistAnswer(it.id, val);
      setTransitioning(true);
      setTimeout(() => {
        setHover(null);
        if (idx < total - 1) {
          setIdx((i) => i + 1);
        } else {
          router.push(resultsHref);
        }
        setTransitioning(false);
      }, 480);
    },
    [idx, total, router, resultsHref, persistAnswer],
  );

  const goTo = useCallback(
    (newIdx: number) => {
      if (newIdx === idx || newIdx < 0 || newIdx >= total) return;
      setHover(null);
      setIdx(newIdx);
    },
    [idx, total],
  );

  /* --------- Keyboard --------- */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        commit(parseInt(e.key, 10));
      } else if (e.key === "ArrowRight" && idx < total - 1) {
        e.preventDefault();
        goTo(idx + 1);
      } else if (e.key === "ArrowLeft" && idx > 0) {
        e.preventDefault();
        goTo(idx - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, total, commit, goTo]);

  /* --------- Dial pointer math --------- */

  function valueFromEvent(clientX: number): number {
    const r = dialRef.current!.getBoundingClientRect();
    const x = (clientX - r.left) / r.width;
    const clamped = Math.max(0, Math.min(1, x));
    return Math.max(1, Math.min(6, Math.ceil(clamped * 6)));
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dialRef.current) return;
    setHover(valueFromEvent(e.clientX));
  }
  function onPointerLeave() {
    if (!dragging) setHover(null);
  }
  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setHover(valueFromEvent(e.clientX));
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    setDragging(false);
    commit(valueFromEvent(e.clientX));
  }

  const progress = (Object.values(answers).filter((a) => a != null).length / total) * 100;
  const opts = SAS_SV_LIKERT;

  return (
    <div
      className="test test-dyn"
      style={{ ["--intensity" as string]: intensity }}
    >
      {/* Atmospheric blob */}
      <div className="test-atmos" aria-hidden="true">
        <div className="test-atmos-blob" />
      </div>

      <div className="test-progress-bar">
        <div className="test-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="test-inner">
        <div className="test-head">
          <div className="test-head-left cd-mono">
            <span className="cd-dim">SAS-SV</span>
            <span className="test-head-line" />
            <span>{t("scaleName")}</span>
          </div>
          <div className="test-head-right cd-mono">
            <span className="test-counter-big">{String(idx + 1).padStart(2, "0")}</span>
            <span className="cd-dim">/</span>
            <span className="cd-dim">{String(total).padStart(2, "0")}</span>
          </div>
        </div>

        <div className="test-dots">
          {SAS_SV_ITEMS.map((it, i) => {
            const answered = answers[it.id] != null;
            return (
              <button
                key={it.id}
                onClick={() => goTo(i)}
                className={cn(
                  "test-dot",
                  i === idx && "test-dot-active",
                  answered && "test-dot-done",
                )}
                aria-label={`Question ${i + 1}`}
              >
                {answered && (
                  <span className="test-dot-val cd-mono">{answers[it.id]}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="test-eyebrow cd-mono">
          {t("questionLabelEyebrow", { n: idx + 1 })}
        </div>

        <div className={cn("test-q-wrap", transitioning && "is-out")} key={idx}>
          <h1 className="test-q">{item.fr}</h1>
        </div>

        {/* Dial */}
        <div className="dial-block">
          <div className="dial-live">
            <span className={cn("dial-live-n cd-mono", display && "on")}>
              {display ? String(display).padStart(2, "0") : "—"}
            </span>
            <span className="dial-live-label" key={liveLabel}>
              {liveLabel}
            </span>
          </div>

          <div
            className={cn("dial", dragging && "is-dragging")}
            ref={dialRef}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => setDragging(false)}
          >
            <div className="dial-track" />
            <div
              className="dial-fill"
              style={{ width: `${((display ?? 0) / 6) * 100}%` }}
            />
            {opts.map((_, i) => {
              const n = i + 1;
              const reached = display != null && n <= display;
              const isVal = v === n;
              return (
                <div
                  key={n}
                  className={cn(
                    "dial-tick",
                    reached && "is-reached",
                    isVal && "is-val",
                  )}
                  style={{ left: `${(n / 6) * 100}%` }}
                >
                  <div className="dial-tick-mark" />
                  <div className="dial-tick-n">{n}</div>
                </div>
              );
            })}
            <div
              className={cn("dial-thumb", display && "on")}
              style={{ left: `${((display ?? 0) / 6) * 100}%` }}
            >
              <div className="dial-thumb-glow" />
              <div className="dial-thumb-dot" />
            </div>
          </div>

          <div className="dial-axis cd-mono cd-dim">
            <span>{t("dialMin")}</span>
            <span className="dial-axis-line" />
            <span>{t("dialMax")}</span>
          </div>

          <div className="dial-shortcuts cd-mono cd-dim">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                className={cn("dial-sc", v === n && "on")}
                onClick={() => commit(n)}
                disabled={savingItemId === item.id}
              >
                {n}
              </button>
            ))}
            <span className="dial-sc-hint">{t("dialKeyboardHint")}</span>
          </div>
        </div>

        <div className="test-foot">
          <button
            className="test-link"
            disabled={idx === 0}
            onClick={() => goTo(idx - 1)}
          >
            ← {t("nav.prev")}
          </button>
          <span className="cd-mono cd-dim">{t("anonNote")}</span>
          <button
            className="test-link"
            disabled={v == null}
            onClick={() => (idx < total - 1 ? goTo(idx + 1) : router.push(resultsHref))}
          >
            {idx < total - 1 ? t("nav.next") : t("nav.seeResults")} →
          </button>
        </div>
      </div>
    </div>
  );
}

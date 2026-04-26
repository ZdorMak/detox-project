"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { SAS_SV_ITEMS, SAS_SV_LIKERT, type SasItem } from "@/lib/survey/sas-sv";
import type { SurveyAnswers } from "@/lib/survey/state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SurveyClientProps {
  initialAnswers: SurveyAnswers;
  initialNextItemId: number | null;
  resultsHref: string;
}

const FIRST_ITEM = SAS_SV_ITEMS[0]!;
const LAST_ITEM = SAS_SV_ITEMS[SAS_SV_ITEMS.length - 1]!;

/**
 * Single-question, slider-driven SAS-SV survey.
 *
 * - One question on screen at a time, slides in from the right.
 * - Answer via a custom-styled native <input type="range"> (1..6) — works
 *   with keyboard, mouse drag, touch, AND screen readers (single
 *   accessible element with aria-valuenow).
 * - Picking a value writes immediately to the server (resume-friendly)
 *   and auto-advances after a short delay so the user feels momentum.
 * - Manual "Suivant" button + keyboard 1..6 / arrows still work as
 *   alternatives.
 */
type Phase = "intro" | "questions" | "loading";

export function SurveyClient({
  initialAnswers,
  initialNextItemId,
  resultsHref,
}: SurveyClientProps) {
  const router = useRouter();
  const t = useTranslations("survey");

  const [answers, setAnswers] = useState<SurveyAnswers>(initialAnswers);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);
  const [errorItemId, setErrorItemId] = useState<number | null>(null);
  const [cursor, setCursor] = useState<number>(
    initialNextItemId ?? LAST_ITEM.id,
  );
  // Show intro only on a totally fresh start (no answers yet).
  const [phase, setPhase] = useState<Phase>(
    Object.keys(initialAnswers).length === 0 ? "intro" : "questions",
  );

  const currentItem = SAS_SV_ITEMS.find((it) => it.id === cursor) ?? FIRST_ITEM;
  const currentIndex = SAS_SV_ITEMS.findIndex((it) => it.id === cursor);
  const answeredCount = Object.keys(answers).length;
  const total = SAS_SV_ITEMS.length;
  const allComplete = answeredCount === total;
  const isCurrentAnswered = answers[cursor] !== undefined;

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prev = SAS_SV_ITEMS[currentIndex - 1];
      if (prev) setCursor(prev.id);
    }
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < SAS_SV_ITEMS.length - 1) {
      const next = SAS_SV_ITEMS[currentIndex + 1];
      if (next) setCursor(next.id);
    }
  }, [currentIndex]);

  const submitAnswer = useCallback(
    async (itemId: number, value: number, autoAdvance = true) => {
      setAnswers((prev) => ({ ...prev, [itemId]: value }));
      setErrorItemId(null);
      setSavingItemId(itemId);
      try {
        const res = await fetch("/api/survey/answer", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ itemId, value }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          ok: boolean;
          isComplete: boolean;
          nextItemId: number | null;
        };
        if (autoAdvance) {
          if (data.isComplete) {
            // Cinematic loading screen, then navigate to results.
            setPhase("loading");
            setTimeout(() => router.push(resultsHref), 2800);
          } else if (data.nextItemId) {
            setTimeout(() => setCursor(data.nextItemId!), 450);
          }
        }
      } catch (err) {
        console.error("answer save failed:", err);
        setErrorItemId(itemId);
        setAnswers((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      } finally {
        setSavingItemId(null);
      }
    },
    [router, resultsHref],
  );

  // Keyboard 1-6 to answer current; arrows for prev/next.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        void submitAnswer(cursor, Number(e.key));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor, submitAnswer, goPrev, goNext]);

  const progressPct = useMemo(
    () => Math.round((answeredCount / total) * 100),
    [answeredCount, total],
  );

  // Intro splash screen — shown before the first question on a fresh start.
  if (phase === "intro") {
    return (
      <IntroSplash
        labels={{
          eyebrow: t("introScreen.eyebrow"),
          title: t("introScreen.title"),
          subtitle: t("introScreen.subtitle"),
          bullets: [
            t("introScreen.bullets.0"),
            t("introScreen.bullets.1"),
            t("introScreen.bullets.2"),
          ],
          start: t("introScreen.start"),
          time: t("introScreen.time"),
        }}
        onStart={() => setPhase("questions")}
      />
    );
  }

  // Loading splash — shown after the final answer, just before /results.
  if (phase === "loading") {
    return (
      <LoadingSplash
        labels={{
          stages: [
            t("loading.stages.0"),
            t("loading.stages.1"),
            t("loading.stages.2"),
            t("loading.stages.3"),
          ],
          almost: t("loading.almost"),
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Sticky progress header */}
      <div
        className="sticky top-0 z-10 -mx-4 mb-8 border-b border-border bg-background/85 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/70"
        role="region"
        aria-label={t("a11y.progressRegion")}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-display text-base font-semibold">
            {t("progress.label", { current: answeredCount, total })}
          </span>
          <span
            aria-live="polite"
            className="font-display text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400"
          >
            {progressPct}%
          </span>
        </div>
        <div
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-rose-100 dark:bg-rose-950/40"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground">
        {t("intro")}
      </p>

      {/* Single question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cursor}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <QuestionCard
            item={currentItem}
            currentValue={answers[currentItem.id]}
            isSaving={savingItemId === currentItem.id}
            hasError={errorItemId === currentItem.id}
            onSelect={(v, autoAdvance = true) =>
              void submitAnswer(currentItem.id, v, autoAdvance)
            }
            t={t}
          />
        </motion.div>
      </AnimatePresence>

      {/* Nav row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          ← {t("nav.prev")}
        </Button>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {t("nav.keyboardHint")}
        </span>
        {currentIndex < SAS_SV_ITEMS.length - 1 ? (
          <Button
            type="button"
            size="lg"
            onClick={goNext}
            disabled={!isCurrentAnswered}
            className={cn(
              "bg-gradient-to-r from-rose-500 to-amber-500 px-6 hover:from-rose-600 hover:to-amber-600",
              !isCurrentAnswered && "opacity-40",
            )}
          >
            {t("nav.next")} →
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={() => router.push(resultsHref)}
            disabled={!allComplete}
            className={cn(
              "bg-gradient-to-r from-emerald-600 to-teal-600 px-6 shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700",
              !allComplete && "opacity-40",
            )}
          >
            {t("nav.seeResults")} →
          </Button>
        )}
      </div>

      {allComplete && currentIndex < SAS_SV_ITEMS.length - 1 && (
        <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center text-sm text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100">
          {t("progress.label", { current: answeredCount, total })} ·{" "}
          <button
            type="button"
            onClick={() => router.push(resultsHref)}
            className="font-semibold underline hover:no-underline"
          >
            {t("nav.seeResults")} →
          </button>
        </div>
      )}
    </div>
  );
}

/* --- Question card with the slider --- */

interface QuestionCardProps {
  item: SasItem;
  currentValue: number | undefined;
  isSaving: boolean;
  hasError: boolean;
  onSelect: (value: number, autoAdvance?: boolean) => void;
  t: ReturnType<typeof useTranslations>;
}

const SLIDER_GRADIENT = "linear-gradient(to right, #14b8a6, #06b6d4, #0ea5e9, #f59e0b, #f97316, #f43f5e)";

function QuestionCard({
  item,
  currentValue,
  isSaving,
  hasError,
  onSelect,
  t,
}: QuestionCardProps) {
  // Local state mirrors the slider so dragging feels instant; we commit on release.
  const [localValue, setLocalValue] = useState<number>(currentValue ?? 3);
  const [committed, setCommitted] = useState<boolean>(currentValue !== undefined);

  // Reset when the item changes (new question loaded).
  useEffect(() => {
    setLocalValue(currentValue ?? 3);
    setCommitted(currentValue !== undefined);
  }, [item.id, currentValue]);

  const handleCommit = (value: number, autoAdvance = true) => {
    setLocalValue(value);
    setCommitted(true);
    onSelect(value, autoAdvance);
  };

  const groupId = `sas-q-${item.id}`;
  const labelOpt = SAS_SV_LIKERT.find((o) => o.value === localValue);

  return (
    <article
      className="relative overflow-hidden rounded-3xl border-2 border-rose-200 bg-card p-6 shadow-xl dark:border-rose-900 sm:p-10"
      aria-current="step"
    >
      {/* Decorative rose halo top-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-rose-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl"
      />

      <div className="relative">
        {/* Question number */}
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-5xl font-bold leading-none text-rose-600 dark:text-rose-400 tabular-nums">
              {String(item.id).padStart(2, "0")}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              / {String(SAS_SV_ITEMS.length).padStart(2, "0")}
            </span>
          </div>
          {isSaving && (
            <span className="text-xs text-muted-foreground" role="status">
              {t("status.saving")}
            </span>
          )}
          {hasError && (
            <span className="text-xs text-destructive" role="alert">
              {t("status.saveFailed")}
            </span>
          )}
          {committed && !isSaving && !hasError && (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              aria-hidden="true"
              title="Saved"
            >
              ✓
            </span>
          )}
        </div>

        {/* The prompt */}
        <p
          id={`${groupId}-prompt`}
          className="font-display mt-6 text-balance text-2xl font-semibold leading-snug sm:text-3xl"
        >
          {item.fr}
        </p>

        {/* Slider */}
        <div className="mt-10">
          {/* Big current value display */}
          <div className="mb-4 flex items-end justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("questionLabel", { n: item.id })}
            </p>
            <div className="text-right">
              <p
                className={cn(
                  "font-display text-6xl font-bold leading-none tabular-nums transition-colors",
                  committed ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground/50",
                )}
              >
                {committed ? localValue : "—"}
              </p>
              {labelOpt && committed && (
                <p className="mt-1 text-sm font-medium">{labelOpt.fr}</p>
              )}
            </div>
          </div>

          {/* Color-graded track + native input */}
          <div className="relative h-12">
            {/* Track background gradient */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full opacity-90"
              style={{ background: SLIDER_GRADIENT }}
            />
            {/* Stops dots */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-1.5"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <span
                  key={n}
                  className="h-2 w-2 rounded-full bg-white/80 shadow"
                />
              ))}
            </div>
            {/* The actual range input */}
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={localValue}
              aria-labelledby={`${groupId}-prompt`}
              onChange={(e) => setLocalValue(Number(e.target.value))}
              onMouseUp={(e) => handleCommit(Number(e.currentTarget.value))}
              onTouchEnd={(e) => handleCommit(Number(e.currentTarget.value))}
              onKeyUp={(e) => handleCommit(Number(e.currentTarget.value))}
              className="survey-slider absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent"
            />
          </div>

          {/* Scale labels */}
          <div className="mt-3 flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
            <span>1 · Pas du tout</span>
            <span>6 · Tout à fait</span>
          </div>

          {/* Quick-tap buttons (1..6) for users who prefer numeric clicks */}
          <div className="mt-6 grid grid-cols-6 gap-1.5">
            {SAS_SV_LIKERT.map((option) => {
              const checked = localValue === option.value && committed;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => handleCommit(option.value)}
                  className={cn(
                    "rounded-lg border-2 py-2 text-center font-display text-sm font-bold tabular-nums transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    checked
                      ? "border-rose-600 bg-rose-600 text-white shadow-md"
                      : "border-border bg-background text-muted-foreground hover:border-rose-300 hover:text-foreground",
                  )}
                >
                  {option.value}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slider thumb styling — must be in a global style block since pseudo-elements
          can't be styled by Tailwind alone. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .survey-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: white;
              border: 3px solid #f43f5e;
              box-shadow: 0 6px 20px rgba(244, 63, 94, 0.35);
              cursor: pointer;
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            .survey-slider::-webkit-slider-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 10px 28px rgba(244, 63, 94, 0.45);
            }
            .survey-slider::-webkit-slider-thumb:active {
              transform: scale(1.05);
            }
            .survey-slider::-moz-range-thumb {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: white;
              border: 3px solid #f43f5e;
              box-shadow: 0 6px 20px rgba(244, 63, 94, 0.35);
              cursor: pointer;
            }
            .survey-slider:focus-visible::-webkit-slider-thumb {
              outline: 3px solid #fb7185;
              outline-offset: 4px;
            }
          `,
        }}
      />
    </article>
  );
}

/* ---------- Intro splash ---------- */

interface IntroSplashProps {
  labels: {
    eyebrow: string;
    title: string;
    subtitle: string;
    bullets: readonly string[];
    start: string;
    time: string;
  };
  onStart: () => void;
}

function IntroSplash({ labels, onStart }: IntroSplashProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl px-4 py-16 text-center"
    >
      {/* Big animated emoji */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
        className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-amber-100 text-6xl shadow-xl dark:from-rose-950/40 dark:to-amber-950/40"
        aria-hidden="true"
      >
        🧠
      </motion.div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-rose-700 dark:text-rose-300">
        {labels.eyebrow}
      </p>
      <h2 className="font-display mt-4 text-balance text-4xl font-bold leading-tight sm:text-5xl">
        {labels.title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
        {labels.subtitle}
      </p>

      <ul className="mx-auto mt-10 max-w-md space-y-3 text-left">
        {labels.bullets.map((b, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-xs font-bold text-white"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed">{b}</span>
          </motion.li>
        ))}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-10 flex flex-col items-center gap-3"
      >
        <Button
          size="lg"
          onClick={onStart}
          className="bg-gradient-to-r from-rose-500 to-amber-500 px-10 py-6 text-base font-semibold shadow-xl shadow-rose-500/30 hover:from-rose-600 hover:to-amber-600 hover:shadow-2xl"
        >
          {labels.start} →
        </Button>
        <p className="text-xs text-muted-foreground">⏱ {labels.time}</p>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Loading splash ---------- */

interface LoadingSplashProps {
  labels: {
    stages: readonly string[];
    almost: string;
  };
}

function LoadingSplash({ labels }: LoadingSplashProps) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (stage >= labels.stages.length - 1) return;
    const t = setTimeout(() => setStage((s) => s + 1), 700);
    return () => clearTimeout(t);
  }, [stage, labels.stages.length]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      {/* Pulsing brain icon with rings */}
      <div className="relative h-32 w-32" aria-hidden="true">
        <motion.div
          className="absolute inset-0 rounded-full bg-rose-300"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-amber-300"
          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
        />
        <div className="absolute inset-4 flex items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-amber-100 text-5xl shadow-2xl dark:from-rose-950/40 dark:to-amber-950/40">
          🧠
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={stage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="font-display mt-8 text-xl font-semibold sm:text-2xl"
          aria-live="polite"
        >
          {labels.stages[stage] ?? labels.stages[labels.stages.length - 1]}
        </motion.p>
      </AnimatePresence>

      <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-rose-100 dark:bg-rose-950/40">
        <motion.div
          className="h-full bg-gradient-to-r from-rose-500 to-amber-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.6, ease: "easeInOut" }}
        />
      </div>

      <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
        {labels.almost}
      </p>
    </div>
  );
}

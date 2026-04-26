"use client";

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SAS_SV_ITEMS, SAS_SV_LIKERT, type SasItem } from "@/lib/survey/sas-sv";
import type { SurveyAnswers } from "@/lib/survey/state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SurveyClientProps {
  initialAnswers: SurveyAnswers;
  initialNextItemId: number | null;
  resultsHref: string;
}

// SAS_SV_ITEMS is a const-tuple of 10 entries (see src/lib/survey/sas-sv.ts).
// These never undefined — assert once here so the rest of the component reads cleanly.
const FIRST_ITEM = SAS_SV_ITEMS[0]!;
const LAST_ITEM = SAS_SV_ITEMS[SAS_SV_ITEMS.length - 1]!;

/**
 * Mobile-first SAS-SV survey UI.
 * - 1 question per screen on small viewports.
 * - 3 questions per screen on >= md viewports.
 * - Keyboard nav: Tab + 1..6 to answer, ArrowLeft/Right for prev/next.
 * - Persists each answer to /api/survey/answer immediately (resume-friendly).
 * - WCAG 2.1 AA: visible focus rings, ARIA radiogroup, live region for status.
 */
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
  // Use the first unanswered item as cursor; if all answered, point to the last one.
  const [cursor, setCursor] = useState<number>(
    initialNextItemId ?? LAST_ITEM.id,
  );

  const answeredCount = Object.keys(answers).length;
  const total = SAS_SV_ITEMS.length;
  const allComplete = answeredCount === total;

  // Per-card refs so we can scroll the active card into view on mobile.
  const cardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    const node = cardRefs.current.get(cursor);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [cursor]);

  const submitAnswer = useCallback(
    async (itemId: number, value: number) => {
      // Optimistic update for snappy UX.
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
        if (data.isComplete) {
          // Brief pause so the user sees their last selection before redirect.
          setTimeout(() => router.push(resultsHref), 250);
        } else if (data.nextItemId) {
          setCursor(data.nextItemId);
        }
      } catch (err) {
        console.error("answer save failed:", err);
        setErrorItemId(itemId);
        // Roll back the optimistic update so the UI doesn't lie about state.
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

  const goPrev = useCallback(() => {
    const idx = SAS_SV_ITEMS.findIndex((it) => it.id === cursor);
    if (idx > 0) {
      const prev = SAS_SV_ITEMS[idx - 1];
      if (prev) setCursor(prev.id);
    }
  }, [cursor]);

  const goNext = useCallback(() => {
    const idx = SAS_SV_ITEMS.findIndex((it) => it.id === cursor);
    if (idx < SAS_SV_ITEMS.length - 1) {
      const next = SAS_SV_ITEMS[idx + 1];
      if (next) setCursor(next.id);
    }
  }, [cursor]);

  // Global key handler: 1-6 to answer current; arrows to navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Avoid hijacking when user is typing somewhere with text input.
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Sticky progress header — bigger, with rich progress bar */}
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

      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{t("intro")}</p>

      <ol className="space-y-5">
        {SAS_SV_ITEMS.map((item) => (
          <li key={item.id} className="list-none">
            <QuestionCard
              ref={(el) => {
                cardRefs.current.set(item.id, el);
              }}
              item={item}
              currentValue={answers[item.id]}
              isActive={cursor === item.id}
              isSaving={savingItemId === item.id}
              hasError={errorItemId === item.id}
              onSelect={(v) => void submitAnswer(item.id, v)}
              onFocusActivate={() => setCursor(item.id)}
              t={t}
            />
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={goPrev}
          disabled={cursor === FIRST_ITEM.id}
        >
          ← {t("nav.prev")}
        </Button>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {t("nav.keyboardHint")}
        </span>
        <Button
          type="button"
          variant="ghost"
          onClick={goNext}
          disabled={cursor === LAST_ITEM.id}
        >
          {t("nav.next")} →
        </Button>
      </div>

      {allComplete && (
        <div className="mt-10 rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center shadow-lg dark:border-emerald-700 dark:from-emerald-950/40 dark:to-teal-950/40">
          <p className="font-display text-lg font-semibold text-emerald-800 dark:text-emerald-100">
            ✓ {t("progress.label", { current: answeredCount, total })}
          </p>
          <Button
            onClick={() => router.push(resultsHref)}
            size="lg"
            className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 px-8 shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700"
          >
            {t("nav.seeResults")} →
          </Button>
        </div>
      )}
    </div>
  );
}

interface QuestionCardProps {
  item: SasItem;
  currentValue: number | undefined;
  isActive: boolean;
  isSaving: boolean;
  hasError: boolean;
  onSelect: (value: number) => void;
  onFocusActivate: () => void;
  t: ReturnType<typeof useTranslations>;
}

/**
 * Likert palette: graded 1 (strong disagree, cool teal) → 6 (strong agree,
 * warm rose). Picked to feel symmetric around the middle and match the
 * survey's overall colour story.
 */
const LIKERT_PALETTE: Record<number, { bg: string; ring: string; ringSel: string; bgSel: string; text: string; textSel: string }> = {
  1: { bg: "bg-teal-50 dark:bg-teal-950/30",       ring: "border-teal-200 dark:border-teal-800",       ringSel: "border-teal-600",   bgSel: "bg-teal-600",   text: "text-teal-900 dark:text-teal-100",   textSel: "text-white" },
  2: { bg: "bg-cyan-50 dark:bg-cyan-950/30",       ring: "border-cyan-200 dark:border-cyan-800",       ringSel: "border-cyan-600",   bgSel: "bg-cyan-600",   text: "text-cyan-900 dark:text-cyan-100",   textSel: "text-white" },
  3: { bg: "bg-sky-50 dark:bg-sky-950/30",         ring: "border-sky-200 dark:border-sky-800",         ringSel: "border-sky-600",    bgSel: "bg-sky-600",    text: "text-sky-900 dark:text-sky-100",     textSel: "text-white" },
  4: { bg: "bg-amber-50 dark:bg-amber-950/30",     ring: "border-amber-200 dark:border-amber-800",     ringSel: "border-amber-600",  bgSel: "bg-amber-600",  text: "text-amber-900 dark:text-amber-100", textSel: "text-white" },
  5: { bg: "bg-orange-50 dark:bg-orange-950/30",   ring: "border-orange-200 dark:border-orange-800",   ringSel: "border-orange-600", bgSel: "bg-orange-600", text: "text-orange-900 dark:text-orange-100", textSel: "text-white" },
  6: { bg: "bg-rose-50 dark:bg-rose-950/30",       ring: "border-rose-200 dark:border-rose-800",       ringSel: "border-rose-600",   bgSel: "bg-rose-600",   text: "text-rose-900 dark:text-rose-100",   textSel: "text-white" },
};

function QuestionCardInner(
  {
    item,
    currentValue,
    isActive,
    isSaving,
    hasError,
    onSelect,
    onFocusActivate,
    t,
  }: QuestionCardProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const groupId = `sas-q-${item.id}`;
  const isAnswered = currentValue !== undefined;
  return (
    <div
      ref={ref}
      onFocus={onFocusActivate}
      onClick={onFocusActivate}
      className={cn(
        "group relative rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300",
        isActive
          ? "border-rose-300 shadow-lg ring-4 ring-rose-200/40 dark:border-rose-700 dark:ring-rose-900/30"
          : "border-border hover:border-rose-200 hover:shadow-md",
      )}
      aria-current={isActive ? "step" : undefined}
    >
      {/* Top-right answered indicator */}
      {isAnswered && !isSaving && (
        <span
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          aria-hidden="true"
          title="Answered"
        >
          ✓
        </span>
      )}

      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span
            className="font-display text-3xl font-bold leading-none text-rose-600 dark:text-rose-400 tabular-nums"
          >
            {String(item.id).padStart(2, "0")}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("questionLabel", { n: item.id })}
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
      </div>

      <p
        id={`${groupId}-prompt`}
        className="font-display mb-6 text-balance text-lg font-semibold leading-snug sm:text-xl"
      >
        {item.fr}
      </p>

      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-prompt`}
        className="grid grid-cols-3 gap-2 sm:grid-cols-6"
      >
        {SAS_SV_LIKERT.map((option) => {
          const checked = currentValue === option.value;
          const palette = LIKERT_PALETTE[option.value]!;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={isActive ? 0 : -1}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(option.value);
              }}
              className={cn(
                "flex min-h-[4rem] flex-col items-center justify-center rounded-xl border-2 px-2 py-2 text-xs font-medium leading-tight transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                checked
                  ? `${palette.ringSel} ${palette.bgSel} ${palette.textSel} shadow-md scale-[1.03]`
                  : `${palette.ring} ${palette.bg} ${palette.text} hover:scale-[1.03]`,
              )}
            >
              <span
                className={cn(
                  "font-display text-xl font-bold tabular-nums",
                  checked ? "" : "opacity-90",
                )}
              >
                {option.value}
              </span>
              <span className="mt-0.5 px-1 text-[9px] sm:text-[10px]">{option.fr}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}

const QuestionCard = forwardRef<HTMLDivElement, QuestionCardProps>(QuestionCardInner);
QuestionCard.displayName = "QuestionCard";

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
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Sticky progress header */}
      <div
        className="sticky top-0 z-10 -mx-4 mb-6 bg-background/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="region"
        aria-label={t("a11y.progressRegion")}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {t("progress.label", { current: answeredCount, total })}
          </span>
          <span aria-live="polite" className="text-muted-foreground">
            {t("progress.percent", { pct: progressPct })}
          </span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{t("intro")}</p>

      <ol className="space-y-4">
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

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={goPrev}
          disabled={cursor === FIRST_ITEM.id}
        >
          ← {t("nav.prev")}
        </Button>
        <span className="text-xs text-muted-foreground">{t("nav.keyboardHint")}</span>
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
        <div className="mt-6 flex justify-end">
          <Button onClick={() => router.push(resultsHref)} size="lg">
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
  return (
    <div
      ref={ref}
      onFocus={onFocusActivate}
      onClick={onFocusActivate}
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm transition-all",
        isActive ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
      aria-current={isActive ? "step" : undefined}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("questionLabel", { n: item.id })}
        </span>
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
        className="mb-4 text-base font-medium leading-snug"
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
                "flex min-h-[3rem] flex-col items-center justify-center rounded-md border text-xs font-medium leading-tight transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <span className="text-base font-bold">{option.value}</span>
              <span className="mt-0.5 px-1 text-[10px] sm:text-xs">{option.fr}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const QuestionCard = forwardRef<HTMLDivElement, QuestionCardProps>(QuestionCardInner);
QuestionCard.displayName = "QuestionCard";

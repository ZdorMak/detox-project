"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { ChallengeCard } from "@/lib/challenges/cards";
import { getAchievement } from "@/lib/challenges/achievements";
import { Button } from "@/components/ui/button";
import { AchievementToast } from "./AchievementToast";

type Phase = "intro" | "active";
type Outcome = "completed" | "skipped" | "declined";

interface ProgramRunnerProps {
  programId: string;
  stepIndex: number;
  totalSteps: number;
  card: ChallengeCard;
  homeHref: string;
  profileHref: string;
}

/**
 * Linear program flow — one card at a time, position dictated by step_index.
 * Logs to BOTH `program_progress` (for the program's own state) and the
 * regular `/api/challenges/log` (so the card counts toward the global
 * level + achievements).
 */
export function ProgramRunner({
  programId,
  stepIndex,
  totalSteps,
  card,
  homeHref,
  profileHref,
}: ProgramRunnerProps) {
  const t = useTranslations("challenges");
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [pending, setPending] = useState(false);
  const [pendingToasts, setPendingToasts] = useState<string[]>([]);

  const submit = useCallback(
    async (outcome: Outcome) => {
      if (pending) return;
      setPending(true);
      try {
        // 1) Log the attempt to the global tracker (drives level + achievements).
        const logRes = await fetch("/api/challenges/log", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cardId: card.id, outcome }),
        });
        if (logRes.ok) {
          const data = (await logRes.json()) as { unlocked?: string[] };
          if (data.unlocked && data.unlocked.length > 0) {
            const known = data.unlocked.filter((id) => getAchievement(id));
            if (known.length > 0) setPendingToasts((q) => [...q, ...known]);
          }
        }

        // 2) Record the program-specific step.
        await fetch("/api/challenges/program-step", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            programId,
            stepIndex,
            cardId: card.id,
            outcome,
          }),
        });

        // 3) If we just finished the last step, mark program completion.
        if (stepIndex + 1 >= totalSteps && outcome !== "declined") {
          await fetch("/api/challenges/log", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              cardId: "__program_completed__",
              outcome: "completed",
            }),
          }).catch(() => {});
          router.push(profileHref);
          return;
        }

        // 4) Re-fetch the next step by re-navigating to the program URL.
        router.refresh();
      } finally {
        setPending(false);
      }
    },
    [card.id, pending, programId, profileHref, router, stepIndex, totalSteps],
  );

  return (
    <>
      <AchievementToast
        queue={pendingToasts}
        onDismiss={(id) => setPendingToasts((q) => q.filter((x) => x !== id))}
      />

      {/* Sticky progress for the program itself */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>{t("programs.progress")}</span>
          <span>
            {stepIndex} / {totalSteps}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={Math.round((stepIndex / totalSteps) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.round((stepIndex / totalSteps) * 100)}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "intro" ? (
          <motion.div
            key={`intro-${card.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
          >
            <div className="rounded-2xl border-2 border-border bg-card p-8 shadow-sm">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                <span>{t(`categories.${card.category}` as const)}</span>
                <span>{t("cardMeta.duration", { min: card.durationMin })}</span>
              </div>
              <div className="mt-6 text-center text-7xl" aria-hidden="true">
                {card.emoji}
              </div>
              <h2 className="mt-6 text-balance text-center text-2xl font-bold leading-tight sm:text-3xl">
                {t(`cards.${card.id}.title` as const)}
              </h2>
              <p className="mt-3 text-balance text-center text-base leading-relaxed text-muted-foreground">
                {t(`cards.${card.id}.body` as const)}
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button size="lg" onClick={() => setPhase("active")} disabled={pending}>
                {t("actions.accept")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => void submit("declined")}
                disabled={pending}
              >
                {t("actions.decline")}
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("hints.honor")}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`active-${card.id}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="rounded-2xl border-2 border-primary bg-card p-8 shadow-md ring-4 ring-primary/10">
              <div className="text-center text-xs uppercase tracking-wider text-primary">
                {t("active.label")}
              </div>
              <div className="mt-4 text-center text-6xl" aria-hidden="true">
                {card.emoji}
              </div>
              <h2 className="mt-4 text-balance text-center text-xl font-semibold leading-tight">
                {t(`cards.${card.id}.title` as const)}
              </h2>
              <p className="mt-3 text-balance text-center text-sm text-muted-foreground">
                {t("active.hint", { min: card.durationMin })}
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button size="lg" onClick={() => void submit("completed")} disabled={pending}>
                ✓ {t("actions.completed")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => void submit("skipped")}
                disabled={pending}
              >
                {t("actions.skipped")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-center">
        <Button asChild variant="ghost" size="sm">
          <a href={homeHref}>{t("programs.backToList")}</a>
        </Button>
      </div>
    </>
  );
}

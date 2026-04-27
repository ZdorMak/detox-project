"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { ChallengeCard, Location } from "@/lib/challenges/cards";
import { getAchievement } from "@/lib/challenges/achievements";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocationPicker } from "./LocationPicker";
import { AchievementToast } from "./AchievementToast";

type Phase = "intro" | "active" | "done";
type Outcome = "completed" | "skipped" | "declined";

interface GameProps {
  initialCard: ChallengeCard | null;
  initialCompleted: number;
  initialSkipped: number;
  initialLocation: Location;
  homeHref: string;
  profileHref: string;
}

const LOCATION_STORAGE_KEY = "detox_location_v1";

/**
 * "Pose le téléphone" client UI. Honor system — the player tells the game
 * whether they actually did the thing.
 *
 * Loop: pick location → draw card → accept / decline →
 * (if accepted) "j'ai fait" / "skip" → server log → fetch next card.
 */
export function Game({
  initialCard,
  initialCompleted,
  initialSkipped,
  initialLocation,
  homeHref,
  profileHref,
}: GameProps) {
  const t = useTranslations("challenges");
  const router = useRouter();

  const [location, setLocation] = useState<Location>(initialLocation);
  const [card, setCard] = useState<ChallengeCard | null>(initialCard);
  const [phase, setPhase] = useState<Phase>(initialCard ? "intro" : "done");
  const [completed, setCompleted] = useState(initialCompleted);
  const [skipped, setSkipped] = useState(initialSkipped);
  const [pending, setPending] = useState(false);
  /** Achievements just unlocked, queued for toast display. */
  const [pendingToasts, setPendingToasts] = useState<string[]>([]);

  // Hydrate location from localStorage on mount — the server-rendered initial
  // value is just a fallback when localStorage is empty.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored && stored !== location) {
      const valid = ["home", "school", "transport", "outside", "with_friends"];
      if (valid.includes(stored)) {
        setLocation(stored as Location);
        // Refetch card for the localStorage location.
        void fetchNextCard(stored as Location).then((next) => {
          if (next) {
            setCard(next);
            setPhase("intro");
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistLocation = useCallback((loc: Location) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, loc);
    }
  }, []);

  const fetchNextCard = useCallback(
    async (loc: Location): Promise<ChallengeCard | null> => {
      // Pass the local hour so the server can filter time-inappropriate cards
      // (no late-night jumping jacks, no 3 a.m. phone calls).
      const hour = new Date().getHours();
      const res = await fetch(
        `/api/challenges/next?location=${encodeURIComponent(loc)}&hour=${hour}`,
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { card: ChallengeCard | null };
      return data.card;
    },
    [],
  );

  const handleLocationChange = useCallback(
    async (next: Location) => {
      setLocation(next);
      persistLocation(next);
      setPending(true);
      try {
        const nextCard = await fetchNextCard(next);
        setCard(nextCard);
        setPhase(nextCard ? "intro" : "done");
      } finally {
        setPending(false);
      }
    },
    [fetchNextCard, persistLocation],
  );

  const logOutcome = useCallback(
    async (outcome: Outcome) => {
      if (!card || pending) return;
      setPending(true);
      try {
        const res = await fetch("/api/challenges/log", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cardId: card.id, outcome }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { ok: boolean; unlocked: string[] };
        if (outcome === "completed") setCompleted((n) => n + 1);
        if (outcome === "skipped") setSkipped((n) => n + 1);
        if (data.unlocked && data.unlocked.length > 0) {
          // Only queue achievements we know about (defensive).
          const known = data.unlocked.filter((id) => getAchievement(id));
          if (known.length > 0) {
            setPendingToasts((q) => [...q, ...known]);
          }
        }
        const next = await fetchNextCard(location);
        if (next) {
          setCard(next);
          setPhase("intro");
        } else {
          setCard(null);
          setPhase("done");
        }
      } catch (err) {
        console.error("[challenges/game] log failed:", err);
      } finally {
        setPending(false);
      }
    },
    [card, pending, location, fetchNextCard],
  );

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <AchievementToast
        queue={pendingToasts}
        onDismiss={(id) => setPendingToasts((q) => q.filter((x) => x !== id))}
      />

      <div className="mb-4">
        <LocationPicker value={location} onChange={(l) => void handleLocationChange(l)} />
      </div>

      <ProgressHeader
        completed={completed}
        skipped={skipped}
        labels={{
          completed: t("progress.completed"),
          skipped: t("progress.skipped"),
        }}
      />

      <AnimatePresence mode="wait">
        {(phase === "done" || !card) && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
          >
            <DoneCard
              completed={completed}
              skipped={skipped}
              homeHref={homeHref}
              onRouter={router.push}
              labels={{
                title: t("done.title"),
                body: t("done.body", { completed, skipped }),
                home: t("done.home"),
              }}
            />
          </motion.div>
        )}
        {phase === "intro" && card && (
          <motion.div
            key={`intro-${card.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
          >
            <CardFace card={card} t={t} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button size="lg" onClick={() => setPhase("active")} disabled={pending}>
                {t("actions.accept")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => void logOutcome("declined")}
                disabled={pending}
              >
                {t("actions.decline")}
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("hints.honor")}
            </p>
            <div className="mt-4 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(profileHref)}
              >
                {t("actions.finish")}
              </Button>
            </div>
          </motion.div>
        )}
        {phase === "active" && card && (
          <motion.div
            key={`active-${card.id}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
          >
            <ActiveCard card={card} t={t} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                onClick={() => void logOutcome("completed")}
                disabled={pending}
              >
                ✓ {t("actions.completed")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => void logOutcome("skipped")}
                disabled={pending}
              >
                {t("actions.skipped")}
              </Button>
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(profileHref)}
              >
                {t("actions.finish")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProgressHeaderProps {
  completed: number;
  skipped: number;
  labels: { completed: string; skipped: string };
}

function ProgressHeader({ completed, skipped, labels }: ProgressHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-center gap-6 text-sm">
      <Stat value={completed} label={labels.completed} tone="positive" />
      <Stat value={skipped} label={labels.skipped} tone="neutral" />
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "positive" | "neutral";
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={cn(
          "text-2xl font-bold tabular-nums",
          tone === "positive" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

interface CardFaceProps {
  card: ChallengeCard;
  t: ReturnType<typeof useTranslations>;
}

function CardFace({ card, t }: CardFaceProps) {
  return (
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
  );
}

function ActiveCard({ card, t }: CardFaceProps) {
  return (
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
  );
}

interface DoneCardProps {
  completed: number;
  skipped: number;
  homeHref: string;
  onRouter: (href: string) => void;
  labels: { title: string; body: string; home: string };
}

function DoneCard({ completed, skipped, homeHref, onRouter, labels }: DoneCardProps) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center">
      <div className="text-6xl" aria-hidden="true">🌳</div>
      <h2 className="mt-4 text-3xl font-bold">{labels.title}</h2>
      <p className="mt-3 text-lg text-muted-foreground">{labels.body}</p>
      <div className="mt-6 flex justify-center gap-6 text-sm">
        <Stat value={completed} label="✓" tone="positive" />
        <Stat value={skipped} label="↷" tone="neutral" />
      </div>
      <Button className="mt-8" size="lg" onClick={() => onRouter(homeHref)}>
        {labels.home}
      </Button>
    </div>
  );
}

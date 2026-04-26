"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { getAchievement } from "@/lib/challenges/achievements";

interface AchievementToastProps {
  /** Queue of achievement ids to display, oldest first. */
  queue: string[];
  /** Called when a toast self-dismisses. */
  onDismiss: (id: string) => void;
}

const DISPLAY_MS = 3500;

/**
 * Stack of toasts shown when the player unlocks new achievements.
 * Auto-dismisses each one after DISPLAY_MS. Click to dismiss early.
 *
 * Renders inside the page (not a portal) — the parent positions it; we use
 * fixed positioning so it floats over the rest of the UI regardless.
 */
export function AchievementToast({ queue, onDismiss }: AchievementToastProps) {
  const t = useTranslations("challenges.achievements");

  // Auto-dismiss timer for the *first* toast in the queue.
  useEffect(() => {
    if (queue.length === 0) return;
    const id = queue[0]!;
    const timer = setTimeout(() => onDismiss(id), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [queue, onDismiss]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {queue.map((id) => {
          const def = getAchievement(id);
          if (!def) return null;
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => onDismiss(id)}
              initial={{ opacity: 0, y: -32, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-auto flex items-center gap-3 rounded-full border-2 border-amber-400 bg-amber-50 px-5 py-3 text-amber-900 shadow-lg dark:border-amber-500 dark:bg-amber-950 dark:text-amber-100"
            >
              <span aria-hidden="true" className="text-2xl">{def.emoji}</span>
              <div className="text-left">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  {t("toast.unlocked")}
                </div>
                <div className="text-sm font-bold">
                  {t(`items.${id}.title` as const)}
                </div>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

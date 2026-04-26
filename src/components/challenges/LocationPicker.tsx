"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ALL_LOCATIONS, type Location } from "@/lib/challenges/cards";
import { cn } from "@/lib/utils";

interface LocationPickerProps {
  value: Location;
  onChange: (next: Location) => void;
}

const LOCATION_EMOJI: Record<Location, string> = {
  home: "🏠",
  school: "🏫",
  transport: "🚌",
  outside: "🌳",
  with_friends: "👥",
};

/**
 * Collapsible "where are you right now?" picker.
 *
 * Default state: a single pill showing the current location + a chevron.
 * Click → expands into a row of selectable pills. Pick one → collapses again.
 * Click outside or press Escape → collapses without changing the value.
 *
 * Choice is persisted in localStorage by the parent (`Game.tsx`).
 */
export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const t = useTranslations("challenges.locations");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {/* Current-location button (always visible). */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("ariaLabel")}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-background hover:border-primary hover:bg-accent",
        )}
      >
        <span aria-hidden="true" className="text-lg">{LOCATION_EMOJI[value]}</span>
        <span>{t(`options.${value}` as const)}</span>
        <span aria-hidden="true" className="text-xs opacity-60">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Other locations — only when expanded. */}
      {open && (
        <div
          role="listbox"
          aria-label={t("ariaLabel")}
          className="flex w-full flex-wrap items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm sm:w-auto"
        >
          <span className="mr-1 text-xs uppercase tracking-wider text-muted-foreground">
            {t("changeTo")}
          </span>
          {ALL_LOCATIONS.filter((l) => l !== value).map((loc) => (
            <button
              key={loc}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => {
                onChange(loc);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                "border-input bg-background hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <span aria-hidden="true">{LOCATION_EMOJI[loc]}</span>
              <span>{t(`options.${loc}` as const)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

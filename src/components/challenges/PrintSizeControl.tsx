"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Card-size presets — physical dimensions in millimetres.
 * On screen, mm units render at ~3.78px each (assumes 96dpi).
 * On print, these become the actual paper-stock dimensions.
 */
const SIZES = [
  { id: "mini",   label: "Mini",   dim: "4.1 × 6.3 cm",  w: 41, h: 63 },
  { id: "bridge", label: "Bridge", dim: "5.7 × 8.9 cm",  w: 57, h: 89 },
  { id: "poker",  label: "Poker",  dim: "6.3 × 8.8 cm",  w: 63, h: 88 },
  { id: "tarot",  label: "Tarot",  dim: "6.8 × 9.5 cm",  w: 68, h: 95 },
  { id: "large",  label: "Large",  dim: "7.0 × 12.1 cm", w: 70, h: 121 },
] as const;

type SizeId = (typeof SIZES)[number]["id"];
const DEFAULT_ID: SizeId = "poker";
const STORAGE_KEY = "detox_print_size_v1";

interface PrintSizeControlProps {
  /** Optional left-side label (translated). */
  label?: string;
}

/**
 * Compact 5-button segmented control to choose the printed card size.
 *
 * Sets two CSS custom properties on `<html>`: `--card-w` and `--card-h`,
 * both in `mm`. The PrintableDeck reads those variables, so the live
 * preview matches what comes out of the printer. The choice is persisted
 * to localStorage so you don't have to re-pick after a refresh.
 *
 * Hidden when printing — the buttons themselves are not part of the
 * deliverable.
 */
export function PrintSizeControl({ label }: PrintSizeControlProps) {
  const [selected, setSelected] = useState<SizeId>(DEFAULT_ID);

  // Hydrate from localStorage on mount and apply the resulting size.
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(STORAGE_KEY) as SizeId | null)
        : null;
    const id =
      saved && SIZES.some((s) => s.id === saved) ? saved : DEFAULT_ID;
    setSelected(id);
    apply(id);
  }, []);

  const apply = (id: SizeId) => {
    const s = SIZES.find((x) => x.id === id) ?? SIZES[2];
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--card-w", `${s.w}mm`);
    root.style.setProperty("--card-h", `${s.h}mm`);
  };

  const choose = (id: SizeId) => {
    setSelected(id);
    apply(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 print:hidden"
      role="radiogroup"
      aria-label={label ?? "Card size"}
    >
      {label && (
        <span className="mr-1 text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
      {SIZES.map((s) => {
        const active = selected === s.id;
        return (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={`${s.w} × ${s.h} mm`}
            onClick={() => choose(s.id)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <span className="font-medium">{s.label}</span>
            <span className="tabular-nums opacity-70">{s.dim}</span>
          </button>
        );
      })}
    </div>
  );
}

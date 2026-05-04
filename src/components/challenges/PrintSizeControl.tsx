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
const DEFAULT_SIZE: SizeId = "poker";
const SIZE_STORAGE_KEY = "detox_print_size_v1";

type Orientation = "portrait" | "landscape";
const DEFAULT_ORIENTATION: Orientation = "portrait";
const ORIENTATION_STORAGE_KEY = "detox_print_orientation_v1";

const PAGE_STYLE_ID = "pd-print-page-rule";

interface PrintSizeControlProps {
  /** Optional left-side label (translated). */
  label?: string;
}

/**
 * Compact toolbar control: card size (5 presets) + page orientation.
 *
 * On change it does two things:
 *   1. Sets `--card-w` / `--card-h` CSS variables on `<html>` so the live
 *      preview and the printed output share the same physical dimensions.
 *   2. Injects/updates a `<style>` tag with an `@page` rule so the print
 *      orientation matches the choice — Vercel SSR can't customise this
 *      per-user, but a dynamic stylesheet works fine.
 *
 * Both choices are persisted to localStorage so the next visit remembers
 * what the user printed last time.
 *
 * Hidden when printing — the buttons themselves are not part of the
 * deliverable.
 */
export function PrintSizeControl({ label }: PrintSizeControlProps) {
  const [selectedSize, setSelectedSize] = useState<SizeId>(DEFAULT_SIZE);
  const [orientation, setOrientation] = useState<Orientation>(
    DEFAULT_ORIENTATION,
  );

  // Hydrate from localStorage on mount and apply both choices.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedSize = window.localStorage.getItem(SIZE_STORAGE_KEY) as
      | SizeId
      | null;
    const sizeId =
      savedSize && SIZES.some((s) => s.id === savedSize)
        ? savedSize
        : DEFAULT_SIZE;
    setSelectedSize(sizeId);
    applySize(sizeId);

    const savedOrient = window.localStorage.getItem(
      ORIENTATION_STORAGE_KEY,
    ) as Orientation | null;
    const orientId: Orientation =
      savedOrient === "portrait" || savedOrient === "landscape"
        ? savedOrient
        : DEFAULT_ORIENTATION;
    setOrientation(orientId);
    applyOrientation(orientId);
  }, []);

  const applySize = (id: SizeId) => {
    const s = SIZES.find((x) => x.id === id) ?? SIZES[2];
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--card-w", `${s.w}mm`);
    root.style.setProperty("--card-h", `${s.h}mm`);
  };

  const applyOrientation = (o: Orientation) => {
    if (typeof document === "undefined") return;
    let el = document.getElementById(PAGE_STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = PAGE_STYLE_ID;
      document.head.appendChild(el);
    }
    // Tighter margins on landscape (more horizontal room for cards).
    const margin = o === "landscape" ? "4mm" : "5mm";
    el.textContent = `@media print { @page { size: A4 ${o}; margin: ${margin}; } }`;
  };

  const chooseSize = (id: SizeId) => {
    setSelectedSize(id);
    applySize(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIZE_STORAGE_KEY, id);
    }
  };

  const chooseOrientation = (o: Orientation) => {
    setOrientation(o);
    applyOrientation(o);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ORIENTATION_STORAGE_KEY, o);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      {/* Size picker */}
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="radiogroup"
        aria-label={label ?? "Card size"}
      >
        {label && (
          <span className="mr-1 text-xs font-medium text-muted-foreground">
            {label}
          </span>
        )}
        {SIZES.map((s) => {
          const active = selectedSize === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={`${s.w} × ${s.h} mm`}
              onClick={() => chooseSize(s.id)}
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

      {/* Orientation toggle */}
      <div
        className="flex items-center gap-1 rounded-md border border-border bg-background p-0.5"
        role="radiogroup"
        aria-label="Page orientation"
      >
        <OrientationButton
          id="portrait"
          active={orientation === "portrait"}
          onClick={() => chooseOrientation("portrait")}
        />
        <OrientationButton
          id="landscape"
          active={orientation === "landscape"}
          onClick={() => chooseOrientation("landscape")}
        />
      </div>
    </div>
  );
}

/**
 * Single orientation button — small icon, no text. Universal symbol works
 * across all 4 locales.
 */
function OrientationButton({
  id,
  active,
  onClick,
}: {
  id: Orientation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={id}
      title={id === "portrait" ? "Portrait" : "Landscape"}
      onClick={onClick}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {id === "portrait" ? <PortraitIcon /> : <LandscapeIcon />}
    </button>
  );
}

function PortraitIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="2" width="8" height="12" rx="1" />
    </svg>
  );
}

function LandscapeIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="12" height="8" rx="1" />
    </svg>
  );
}

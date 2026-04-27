"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark" | "system";

const STORAGE_KEY = "detox_theme";

/**
 * Three-state theme toggle: light / dark / system.
 *
 * - Reads saved preference from localStorage on mount.
 * - On change, applies the `dark` class to <html> and persists.
 * - "system" mode follows `prefers-color-scheme` and re-evaluates on
 *   media-query changes.
 *
 * The actual class application is also done in a small inline script
 * injected by the layout's <head> to avoid a flash on first paint
 * (FOUC). See `themeInitScript()` below.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEY)
      : null) as Mode | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setMode(stored);
      apply(stored);
    } else {
      apply("system");
    }
  }, []);

  // Live-react to OS-level theme changes when in "system" mode.
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const choose = (next: Mode) => {
    setMode(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    apply(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex rounded-full border border-border bg-card p-0.5 shadow-sm"
    >
      <Option active={mode === "light"} onClick={() => choose("light")} label="Light">
        <Sun className="h-3.5 w-3.5" />
      </Option>
      <Option active={mode === "system"} onClick={() => choose("system")} label="System">
        <Laptop className="h-3.5 w-3.5" />
      </Option>
      <Option active={mode === "dark"} onClick={() => choose("dark")} label="Dark">
        <Moon className="h-3.5 w-3.5" />
      </Option>
    </div>
  );
}

function Option({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}

function apply(mode: Mode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const wantsDark =
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", wantsDark);
  root.style.colorScheme = wantsDark ? "dark" : "light";
}

/**
 * Inline script for the document <head> that applies the saved theme
 * BEFORE React hydrates, preventing a light-mode flash for dark-mode users.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    // Brand defaults to DARK — only flip to light if user explicitly chose 'light'
    // or if they're on 'system' AND their OS prefers light.
    var mode = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'dark';
    var dark =
      mode === 'dark' ||
      (mode === 'system' && (
        !window.matchMedia ||
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        // Treat 'no preference' as dark for the brand.
        !window.matchMedia('(prefers-color-scheme: light)').matches
      ));
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {
    // On any failure, default to dark (brand).
    document.documentElement.classList.add('dark');
  }
})();
`;

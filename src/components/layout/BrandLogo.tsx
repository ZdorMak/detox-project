import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Size in pixels — defaults to 28 (header use). */
  size?: number;
  className?: string;
  /** Show the wordmark next to the icon. */
  withWordmark?: boolean;
}

/**
 * The Detox brand mark — a hollow circle with a gold semi-arc inside.
 * Lifted from the Claude Design export (the splash thumbnail).
 *
 * Pure inline SVG so it uses `currentColor` for the stroke (theme-aware)
 * and ships zero requests.
 */
export function BrandLogo({ size = 28, className, withWordmark = false }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 60 60"
        width={size}
        height={size}
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Outer hollow ring */}
        <circle
          cx="30"
          cy="30"
          r="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          opacity="0.85"
        />
        {/* Filled gold semi-arc — the half-moon "detox starts here" mark */}
        <path
          d="M 16 30 A 14 14 0 0 1 44 30"
          fill="currentColor"
          opacity="0.95"
        />
      </svg>
      {withWordmark && (
        <span
          className="font-display text-lg italic font-semibold tracking-tight"
          style={{ fontStyle: "italic" }}
        >
          detox
        </span>
      )}
    </span>
  );
}

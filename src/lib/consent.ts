/**
 * Consent state persisted client-side in localStorage.
 * Keep this small and stable — it's a public contract with the browser.
 */
export const CONSENT_KEY = "detox.consent.v1";

export type ConsentType = "analytics" | "research";
export type ConsentStatus = "granted" | "declined" | "unknown";

export interface ConsentState {
  analytics: ConsentStatus;
  research: ConsentStatus;
  /** ISO 8601 — when user last interacted with the banner. */
  decidedAt: string | null;
}

export const defaultConsent: ConsentState = {
  analytics: "unknown",
  research: "unknown",
  decidedAt: null,
};

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return defaultConsent;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return defaultConsent;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return {
      analytics: parsed.analytics ?? "unknown",
      research: parsed.research ?? "unknown",
      decidedAt: parsed.decidedAt ?? null,
    };
  } catch {
    return defaultConsent;
  }
}

export function writeConsent(next: ConsentState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
}

export function hasDecided(state: ConsentState): boolean {
  return state.decidedAt !== null;
}

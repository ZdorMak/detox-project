"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  defaultConsent,
  hasDecided,
  readConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/consent";

/**
 * GDPR consent banner shown until the user accepts or declines.
 *
 * - State lives in localStorage (CONSENT_KEY).
 * - Decision is mirrored to /api/consent (consent_log table).
 * - Tracking elsewhere in the app must check `readConsent()` before sending events.
 */
export function ConsentBanner() {
  const t = useTranslations("consent");
  const [state, setState] = useState<ConsentState>(defaultConsent);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(readConsent());
    setMounted(true);
  }, []);

  if (!mounted || hasDecided(state)) return null;

  const decide = async (granted: boolean) => {
    const next: ConsentState = {
      analytics: granted ? "granted" : "declined",
      research: granted ? "granted" : "declined",
      decidedAt: new Date().toISOString(),
    };
    setState(next);
    writeConsent(next);
    // Fire-and-forget; we still record the decision even if the network blip.
    try {
      await Promise.all([
        fetch("/api/consent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ consent_type: "analytics", granted }),
        }),
        fetch("/api/consent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ consent_type: "research", granted }),
        }),
      ]);
    } catch (err) {
      // Don't surface — user has already seen the UI move forward.
      console.warn("[consent] failed to log decision:", err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="container mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex-1 text-sm">
          <p id="consent-title" className="font-semibold">
            {t("title")}
          </p>
          <p className="mt-1 text-muted-foreground">{t("body")}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm" onClick={() => decide(false)}>
            {t("decline")}
          </Button>
          <Button size="sm" onClick={() => decide(true)}>
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}

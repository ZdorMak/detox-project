"use client";

import { useEffect, useState } from "react";

export interface SessionInfo {
  sessionId: string;
}

/**
 * Returns `{ sessionId }` for the current anonymous session.
 * Calls /api/session on mount, which is idempotent — it reads
 * the existing cookie or creates a new row.
 */
export function useSession(): { session: SessionInfo | null; loading: boolean; error: string | null } {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { sessionId: string };
        if (!cancelled) {
          setSession({ sessionId: data.sessionId });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { session, loading, error };
}

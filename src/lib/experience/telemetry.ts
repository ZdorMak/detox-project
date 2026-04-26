/**
 * Thin client-side wrapper around POST /api/video/event.
 *
 * Buffers events and flushes either when the buffer hits 10 entries or after
 * 2 seconds of inactivity, whichever comes first. The /api/video/event
 * endpoint accepts up to 50 events per request.
 *
 * Always best-effort: telemetry failures must never break the experience.
 * Errors are logged to the console; the user-facing flow continues.
 */

type EventInput = {
  event_type: string;
  timestamp_ms?: number;
  video_position_s?: number;
  metadata?: Record<string, unknown>;
};

const FLUSH_AFTER = 10;
const FLUSH_DELAY_MS = 2_000;

const buffer: EventInput[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (timer != null) return;
  timer = setTimeout(() => {
    timer = null;
    void flushNow();
  }, FLUSH_DELAY_MS);
}

export function trackEvent(event: EventInput): void {
  const enriched: EventInput = {
    ...event,
    timestamp_ms: event.timestamp_ms ?? Date.now(),
  };
  buffer.push(enriched);
  if (buffer.length >= FLUSH_AFTER) {
    void flushNow();
  } else {
    scheduleFlush();
  }
}

export async function flushNow(): Promise<void> {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0, buffer.length);
  if (timer != null) {
    clearTimeout(timer);
    timer = null;
  }
  try {
    await fetch("/api/video/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(batch),
      keepalive: true,
    });
  } catch (err) {
    console.warn("[experience/telemetry] flush failed:", err);
    // Drop the batch — this is best-effort analytics, not core flow.
  }
}

/**
 * Wire up a beforeunload handler so anything queued is shipped when the user
 * navigates away. Call this from a top-level effect in the experience.
 */
export function registerUnloadFlush(): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => {
    void flushNow();
  };
  window.addEventListener("pagehide", handler);
  return () => {
    window.removeEventListener("pagehide", handler);
  };
}

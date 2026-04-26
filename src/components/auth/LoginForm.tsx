"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  next: string;
  labels: {
    google: string;
  };
}

/**
 * Sign-in via Google OAuth.
 *
 * Redirects to /auth/callback?next=<safeReturn>, where the route handler
 * exchanges the code for a session cookie and finishes sign-in.
 *
 * Magic-link via email is intentionally OFF for now — the Supabase Free
 * tier's default outbound email rate-limits (~3 emails/hour) are too low
 * for a public deployment. Re-enable once we've configured a proper SMTP
 * provider (Resend / Postmark / SES) in Supabase Dashboard → Auth → SMTP.
 */
export function LoginForm({ next, labels }: LoginFormProps) {
  const t = useTranslations("auth.login");
  const supabase = createClient();
  const [pending, setPending] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const callbackUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(next)}`;

  async function signInWith(provider: "google") {
    setPending(true);
    setOauthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl },
      });
      if (error) {
        console.error("[auth/login] oauth failed:", error);
        setOauthError(error.message);
      }
      // On success, the browser is redirected by Supabase; we never reach here.
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {oauthError && (
        <div role="alert" className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">
          {oauthError}
        </div>
      )}

      <Button
        type="button"
        size="lg"
        variant="outline"
        className="w-full justify-center gap-3"
        disabled={pending}
        onClick={() => void signInWith("google")}
      >
        <GoogleIcon />
        {labels.google}
      </Button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.97 10.71A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.17.28-1.71V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.5.46 3.43 1.34l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

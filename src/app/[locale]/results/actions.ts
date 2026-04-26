"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSession } from "@/lib/session";

/**
 * Server Action invoked from the "Retake" button on the results page.
 *
 * - Deletes all survey_responses for the current anonymous session.
 * - Clears sessions.completed_at so resume guards don't bounce the user
 *   straight back to /results.
 * - Redirects to the locale-prefixed /survey route.
 *
 * The anonymous_id cookie is preserved on purpose — same physical user,
 * same session row, just a fresh attempt.
 */
export async function retakeAction(formData: FormData): Promise<void> {
  const localePrefix = String(formData.get("localePrefix") ?? "");
  const session = await getOrCreateSession();
  const supabase = createAdminClient();

  const { error: delErr } = await supabase
    .from("survey_responses")
    .delete()
    .eq("session_id", session.id);
  if (delErr) {
    console.error("[results/actions] delete responses failed:", delErr);
    await supabase.from("error_log").insert({
      session_id: session.id,
      error_type: "retake_delete",
      message: delErr.message,
    });
    // Don't throw — fall through to redirect so the user isn't stuck.
  }

  const { error: updErr } = await supabase
    .from("sessions")
    .update({ completed_at: null })
    .eq("id", session.id);
  if (updErr) {
    console.error("[results/actions] reset completed_at failed:", updErr);
  }

  redirect(`${localePrefix}/survey`);
}

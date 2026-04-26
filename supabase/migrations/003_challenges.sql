-- 003_challenges.sql
-- Applied via Supabase MCP `apply_migration` on 2026-04-23.
-- Canonical record only — to change schema, write migration 004_..., never edit this file.
--
-- Adds challenge_attempts table for the "Pose le téléphone" mini-game.
-- Tracks every card the user accepted, completed, or skipped (honor system).

CREATE TABLE public.challenge_attempts (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('completed', 'skipped', 'declined')),
  drawn_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  rating SMALLINT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

CREATE INDEX challenge_attempts_session_idx ON public.challenge_attempts(session_id);
CREATE INDEX challenge_attempts_card_idx ON public.challenge_attempts(card_id);
CREATE INDEX challenge_attempts_outcome_idx ON public.challenge_attempts(outcome);

ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;

-- Teachers can read their school's session attempts (same pattern as survey_responses).
CREATE POLICY "challenge_attempts_select_school"
  ON public.challenge_attempts FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.sessions
      WHERE school_id = public.current_teacher_school_id()
    )
  );

COMMENT ON TABLE public.challenge_attempts IS
  'Challenge card attempts in the "Pose le téléphone" mini-game. Honor-system based.';

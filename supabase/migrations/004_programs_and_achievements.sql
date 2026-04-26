-- 004_programs_and_achievements.sql
-- Applied via Supabase MCP `apply_migration` on 2026-04-23.
-- Canonical record only — to change schema, write migration 005_..., never edit this file.
--
-- Adds: programs progress tracking + unlocked achievements per session.
-- Plus a `points` column on challenge_attempts for fast scoring.

CREATE TABLE public.program_progress (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  step_index SMALLINT NOT NULL CHECK (step_index >= 0),
  card_id TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('completed', 'skipped', 'declined')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, program_id, step_index)
);
CREATE INDEX program_progress_session_program_idx
  ON public.program_progress(session_id, program_id);

ALTER TABLE public.program_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "program_progress_select_school"
  ON public.program_progress FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.sessions
      WHERE school_id = public.current_teacher_school_id()
    )
  );

CREATE TABLE public.achievements_unlocked (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, achievement_id)
);
CREATE INDEX achievements_unlocked_session_idx
  ON public.achievements_unlocked(session_id);

ALTER TABLE public.achievements_unlocked ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_unlocked_select_school"
  ON public.achievements_unlocked FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.sessions
      WHERE school_id = public.current_teacher_school_id()
    )
  );

ALTER TABLE public.challenge_attempts
  ADD COLUMN points SMALLINT;

CREATE INDEX challenge_attempts_points_idx
  ON public.challenge_attempts(session_id, points);

COMMENT ON TABLE public.program_progress IS
  'Per-session progress through structured challenge programs.';
COMMENT ON TABLE public.achievements_unlocked IS
  'Achievements unlocked by a session in the "Pose le téléphone" mini-game.';
COMMENT ON COLUMN public.challenge_attempts.points IS
  'Points awarded for the attempt (NULL for pre-004 rows; treat as 0 in aggregations).';

-- 002_survey_idempotency_and_resume.sql
-- Applied via Supabase MCP `apply_migration` on 2026-04-23.
-- This file is the canonical record; if you change schema, write a new
-- migration (003_..., 004_...) — never edit this one.
--
-- Adds:
--   1. Unique constraint on survey_responses(session_id, question_id) for idempotent upserts.
--   2. Composite index on video_events(session_id, event_type) for resume queries.
--   3. Generated column on survey_responses to extract numeric Likert value for fast aggregations.

-- 1. Idempotency: one answer per (session, question). UPSERT-friendly.
ALTER TABLE public.survey_responses
  ADD CONSTRAINT survey_responses_session_question_unique
  UNIQUE (session_id, question_id);

-- 2. Resume queries hit (session_id, event_type) heavily.
CREATE INDEX IF NOT EXISTS video_events_session_type_idx
  ON public.video_events(session_id, event_type);

-- 3. Numeric value column extracted from JSONB for SAS-SV scoring without
--    parsing JSON in every query. Generated, kept in sync automatically.
--    Stored as smallint because Likert values are 1-6.
ALTER TABLE public.survey_responses
  ADD COLUMN value_numeric SMALLINT
  GENERATED ALWAYS AS (
    CASE
      WHEN jsonb_typeof(answer) = 'number' THEN (answer)::TEXT::SMALLINT
      WHEN answer ? 'value' AND jsonb_typeof(answer->'value') = 'number'
        THEN (answer->>'value')::SMALLINT
      ELSE NULL
    END
  ) STORED;

CREATE INDEX IF NOT EXISTS survey_responses_value_numeric_idx
  ON public.survey_responses(session_id, value_numeric);

COMMENT ON COLUMN public.survey_responses.value_numeric IS
  'Auto-extracted Likert value (1-6) from answer JSONB. Used for SAS-SV scoring.';

-- 001_initial_schema.sql
-- Applied via Supabase MCP `apply_migration` on 2026-04-23.
-- This file is the canonical record; if you change schema, write a new
-- migration (002_..., 003_...) — never edit this one.

-- Schools (B2B tenants)
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  canton TEXT,
  plan TEXT NOT NULL DEFAULT 'trial',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teachers (magic-link auth via Supabase Auth)
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Anonymous participant sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT UNIQUE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  user_agent_hash TEXT
);
CREATE INDEX sessions_school_id_idx ON public.sessions(school_id);
CREATE INDEX sessions_started_at_idx ON public.sessions(started_at);

-- Video interaction events
CREATE TABLE public.video_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  timestamp_ms BIGINT NOT NULL,
  video_position_s NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX video_events_session_id_idx ON public.video_events(session_id);
CREATE INDEX video_events_event_type_idx ON public.video_events(event_type);

-- SAS-SV survey responses
CREATE TABLE public.survey_responses (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer JSONB NOT NULL,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX survey_responses_session_id_idx ON public.survey_responses(session_id);

-- GDPR consent log
CREATE TABLE public.consent_log (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  ip_hash TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX consent_log_session_id_idx ON public.consent_log(session_id);

-- Error log
CREATE TABLE public.error_log (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  error_type TEXT,
  message TEXT,
  stack TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all public tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

-- Helper: current teacher's school_id (security definer to read teachers safely from policies)
CREATE OR REPLACE FUNCTION public.current_teacher_school_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.teachers WHERE id = auth.uid();
$$;

-- Teachers can read their own row
CREATE POLICY "teachers_select_own"
  ON public.teachers FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Teachers can read their own school
CREATE POLICY "schools_select_own"
  ON public.schools FOR SELECT TO authenticated
  USING (id = public.current_teacher_school_id());

-- Teachers can read sessions for their school
CREATE POLICY "sessions_select_school"
  ON public.sessions FOR SELECT TO authenticated
  USING (school_id IS NOT NULL AND school_id = public.current_teacher_school_id());

-- Teachers can read video_events for their school's sessions
CREATE POLICY "video_events_select_school"
  ON public.video_events FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.sessions
      WHERE school_id = public.current_teacher_school_id()
    )
  );

-- Teachers can read survey_responses for their school's sessions
CREATE POLICY "survey_responses_select_school"
  ON public.survey_responses FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.sessions
      WHERE school_id = public.current_teacher_school_id()
    )
  );

-- consent_log and error_log: no client SELECT policies; only service_role can access.
-- (RLS enabled with no policies = implicit deny for non-service roles.)

COMMENT ON TABLE public.sessions IS 'Anonymous participant sessions. All writes go through Next.js API routes using service_role.';
COMMENT ON TABLE public.consent_log IS 'GDPR consent log; service_role only.';
COMMENT ON TABLE public.error_log IS 'Application error log; service_role only.';

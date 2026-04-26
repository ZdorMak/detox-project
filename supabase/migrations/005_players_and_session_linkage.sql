-- 005_players_and_session_linkage.sql
-- Applied via Supabase MCP `apply_migration` on 2026-04-23.
-- Canonical record only — to change schema, write migration 006_..., never edit this file.
--
-- Adds:
--   1. `players` table — auth.users-linked profile for player accounts.
--   2. `sessions.user_id` — nullable FK to auth.users for claimed sessions.

CREATE TABLE public.players (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT UNIQUE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select_own"
  ON public.players FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "players_update_own"
  ON public.players FOR UPDATE TO authenticated
  USING (id = auth.uid());

ALTER TABLE public.sessions
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX sessions_user_id_idx ON public.sessions(user_id);

CREATE POLICY "sessions_select_own_user"
  ON public.sessions FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

COMMENT ON TABLE public.players IS
  'Player profiles. Links auth.users to game progress. Optional — anonymous play remains supported.';
COMMENT ON COLUMN public.sessions.user_id IS
  'Set when an anonymous session has been claimed by a player account. Null for unclaimed sessions.';

-- ==============================================================================
-- BYTE WHAT — Supabase Production Database Schema
-- Run this complete script in your Supabase project's SQL Editor
-- ==============================================================================

-- 1. Create table for registered student profiles & domain priorities
CREATE TABLE IF NOT EXISTS public.student_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    path_chosen TEXT NOT NULL DEFAULT 'questionnaire',
    rankings JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy department, year, and creation queries
CREATE INDEX IF NOT EXISTS idx_student_submissions_dept ON public.student_submissions(department);
CREATE INDEX IF NOT EXISTS idx_student_submissions_year ON public.student_submissions(year);
CREATE INDEX IF NOT EXISTS idx_student_submissions_created_at ON public.student_submissions(created_at DESC);

-- 2. Create table for anonymous questionnaire sessions
CREATE TABLE IF NOT EXISTS public.anonymous_sessions (
    id TEXT PRIMARY KEY,
    anonymous_session_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    questions_answered INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_anon_id ON public.anonymous_sessions(anonymous_session_id);

-- 3. Create table for individual question responses
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    selected_option_id TEXT,
    numeric_value INTEGER,
    text_response TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_responses_session ON public.questionnaire_responses(session_id);

-- 4. Create table for finalized questionnaire scoring results
CREATE TABLE IF NOT EXISTS public.questionnaire_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_results_session ON public.questionnaire_results(session_id);

-- 5. Create table for student collaborative projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    creator_pseudonym TEXT NOT NULL,
    creator_session_id TEXT,
    domains JSONB NOT NULL DEFAULT '[]'::jsonb,
    skill_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    difficulty TEXT NOT NULL DEFAULT 'Intermediate',
    status TEXT NOT NULL DEFAULT 'Open',
    team_requirements TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- BYTE WHAT is a public, anonymous student platform without mandatory logins.
-- Anyone can view submissions & public analytics, and anyone can submit responses.
-- ==============================================================================

ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read & write for student_submissions
DROP POLICY IF EXISTS "Public student_submissions select" ON public.student_submissions;
CREATE POLICY "Public student_submissions select" ON public.student_submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public student_submissions insert" ON public.student_submissions;
CREATE POLICY "Public student_submissions insert" ON public.student_submissions FOR INSERT WITH CHECK (true);

-- Allow anonymous read & write for anonymous_sessions
DROP POLICY IF EXISTS "Public anonymous_sessions select" ON public.anonymous_sessions;
CREATE POLICY "Public anonymous_sessions select" ON public.anonymous_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public anonymous_sessions insert" ON public.anonymous_sessions;
CREATE POLICY "Public anonymous_sessions insert" ON public.anonymous_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public anonymous_sessions update" ON public.anonymous_sessions;
CREATE POLICY "Public anonymous_sessions update" ON public.anonymous_sessions FOR UPDATE USING (true);

-- Allow anonymous read & write for questionnaire_responses
DROP POLICY IF EXISTS "Public questionnaire_responses select" ON public.questionnaire_responses;
CREATE POLICY "Public questionnaire_responses select" ON public.questionnaire_responses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public questionnaire_responses insert" ON public.questionnaire_responses;
CREATE POLICY "Public questionnaire_responses insert" ON public.questionnaire_responses FOR INSERT WITH CHECK (true);

-- Allow anonymous read & write for questionnaire_results
DROP POLICY IF EXISTS "Public questionnaire_results select" ON public.questionnaire_results;
CREATE POLICY "Public questionnaire_results select" ON public.questionnaire_results FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public questionnaire_results insert" ON public.questionnaire_results;
CREATE POLICY "Public questionnaire_results insert" ON public.questionnaire_results FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public questionnaire_results update" ON public.questionnaire_results;
CREATE POLICY "Public questionnaire_results update" ON public.questionnaire_results FOR UPDATE USING (true);

-- Allow anonymous read & write for projects
DROP POLICY IF EXISTS "Public projects select" ON public.projects;
CREATE POLICY "Public projects select" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public projects insert" ON public.projects;
CREATE POLICY "Public projects insert" ON public.projects FOR INSERT WITH CHECK (true);


-- ==============================================================================
-- BYTE WHAT — Universal Serverless PostgreSQL Database Schema
-- Works with Neon (neon.tech), Vercel Postgres, Supabase, or standard PostgreSQL
-- Run this complete script in your Neon SQL Editor or Postgres database.
-- ==============================================================================

-- 1. Create table for registered student profiles & domain priorities
CREATE TABLE IF NOT EXISTS student_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    path_chosen TEXT NOT NULL DEFAULT 'questionnaire',
    rankings JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_student_submissions_dept ON student_submissions(department);
CREATE INDEX IF NOT EXISTS idx_student_submissions_year ON student_submissions(year);
CREATE INDEX IF NOT EXISTS idx_student_submissions_created_at ON student_submissions(created_at DESC);

-- 2. Create table for anonymous questionnaire sessions
CREATE TABLE IF NOT EXISTS anonymous_sessions (
    id TEXT PRIMARY KEY,
    anonymous_session_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    questions_answered INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_anon_id ON anonymous_sessions(anonymous_session_id);

-- 3. Create table for individual question responses
CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    selected_option_id TEXT,
    numeric_value INTEGER,
    text_response TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_responses_session ON questionnaire_responses(session_id);

-- 4. Create table for finalized questionnaire scoring results
CREATE TABLE IF NOT EXISTS questionnaire_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_results_session ON questionnaire_results(session_id);

-- 5. Create table for student collaborative projects
CREATE TABLE IF NOT EXISTS projects (
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


-- BYTE WHAT Database Schema Migration
-- Designed for Supabase PostgreSQL with strict RLS and Anonymous Session Support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Domains Table
CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  related_domains TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY, -- e.g. Q001
  question_code TEXT UNIQUE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('universal', 'likert')),
  is_universal BOOLEAN NOT NULL DEFAULT FALSE,
  primary_domain_id TEXT REFERENCES domains(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Question Options Table (For universal questions)
CREATE TABLE IF NOT EXISTS question_options (
  id TEXT PRIMARY KEY, -- e.g. Q001_1
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_value INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0
);

-- 4. Question Domain Mappings Table (Domain-specific questions)
CREATE TABLE IF NOT EXISTS question_domain_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  weight NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(question_id, domain_id)
);

-- 5. Option Domain Mappings Table (Universal options -> domain contributions)
CREATE TABLE IF NOT EXISTS option_domain_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL REFERENCES question_options(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  weight NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
  UNIQUE(option_id, domain_id)
);

-- 6. Questionnaire Sessions Table (Anonymous)
CREATE TABLE IF NOT EXISTS questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_session_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  questions_answered INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Questionnaire Responses Table (Raw responses - private to session)
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id TEXT REFERENCES question_options(id) ON DELETE SET NULL,
  numeric_value INTEGER CHECK (numeric_value BETWEEN 0 AND 4),
  text_response TEXT,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

-- 8. Interest Results Table (Calculated scores)
CREATE TABLE IF NOT EXISTS interest_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  interest_score INTEGER NOT NULL CHECK (interest_score BETWEEN 0 AND 100),
  confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  evidence_count INTEGER NOT NULL DEFAULT 0,
  classification TEXT NOT NULL CHECK (classification IN ('primary', 'secondary', 'emerging', 'low_evidence')),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, domain_id)
);

-- 9. Student Public Profiles Table (Opt-in pseudonymous discovery)
CREATE TABLE IF NOT EXISTS student_public_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_session_id TEXT UNIQUE NOT NULL REFERENCES questionnaire_sessions(anonymous_session_id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  discoverable BOOLEAN NOT NULL DEFAULT TRUE,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Connections Table (Consent-based collaboration requests)
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_profile_id UUID NOT NULL REFERENCES student_public_profiles(id) ON DELETE CASCADE,
  recipient_profile_id UUID NOT NULL REFERENCES student_public_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_profile_id, recipient_profile_id)
);

-- 11. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  creator_profile_id UUID REFERENCES student_public_profiles(id) ON DELETE SET NULL,
  creator_pseudonym TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed')),
  skill_requirements TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'Intermediate' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  team_requirements TEXT NOT NULL DEFAULT 'Seeking motivated collaborators',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Project Domains Join Table
CREATE TABLE IF NOT EXISTS project_domains (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, domain_id)
);

-- 13. Project Applications Table
CREATE TABLE IF NOT EXISTS project_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  applicant_profile_id UUID NOT NULL REFERENCES student_public_profiles(id) ON DELETE CASCADE,
  application_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Analytics Snapshots Table (Aggregates)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_submissions INTEGER NOT NULL DEFAULT 0,
  domain_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Student Submissions Table (Real student registrations & category rankings)
CREATE TABLE IF NOT EXISTS student_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  path_chosen TEXT NOT NULL CHECK (path_chosen IN ('self_selected', 'questionnaire')),
  rankings JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { domainId: string, rank: number }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Fast Performance
CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(primary_domain_id);
CREATE INDEX IF NOT EXISTS idx_responses_session ON questionnaire_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_results_session ON interest_results(session_id);
CREATE INDEX IF NOT EXISTS idx_results_domain ON interest_results(domain_id);
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable ON student_public_profiles(discoverable);
CREATE INDEX IF NOT EXISTS idx_project_domains_domain ON project_domains(domain_id);
CREATE INDEX IF NOT EXISTS idx_student_submissions_department ON student_submissions(department);
CREATE INDEX IF NOT EXISTS idx_student_submissions_year ON student_submissions(year);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_domain_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_domain_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_submissions ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies
CREATE POLICY "Public read for domains" ON domains FOR SELECT USING (true);
CREATE POLICY "Public read for questions" ON questions FOR SELECT USING (is_active = true);
CREATE POLICY "Public read for question options" ON question_options FOR SELECT USING (true);
CREATE POLICY "Public read for question mappings" ON question_domain_mappings FOR SELECT USING (true);
CREATE POLICY "Public read for option mappings" ON option_domain_mappings FOR SELECT USING (true);
CREATE POLICY "Public read for analytics" ON analytics_snapshots FOR SELECT USING (true);
CREATE POLICY "Public read for projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read for project domains" ON project_domains FOR SELECT USING (true);
CREATE POLICY "Public read for discoverable profiles" ON student_public_profiles FOR SELECT USING (discoverable = true);
CREATE POLICY "Public read for student submissions" ON student_submissions FOR SELECT USING (true);
CREATE POLICY "Public insert for student submissions" ON student_submissions FOR INSERT WITH CHECK (true);

-- 2. Restrict Direct Public Access to Raw Responses
-- Anonymous users insert via server-side service role endpoints
-- Privileged service_role has full access by default in Supabase.


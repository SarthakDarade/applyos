-- Ensure professional_profiles table exists and has all required columns
-- This supports the /profile page functionality

CREATE TABLE IF NOT EXISTS professional_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Basic Info
  full_name TEXT,
  headline TEXT,
  location TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin TEXT,
  professional_summary TEXT,
  years_experience INTEGER DEFAULT 0,
  
  -- Arrays / Lists (using JSONB for flexibility with complex objects or simple arrays)
  skills JSONB DEFAULT '[]'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  
  -- Complex Sections
  work_experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  
  -- Derived / Aggregate
  current_position JSONB DEFAULT '{}'::jsonb,
  resume_data JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" 
ON professional_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON professional_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON professional_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Check for missing columns if table already existed (idempotent additions)
DO $$
BEGIN
    BEGIN
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS resume_data JSONB DEFAULT '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column resume_data already exists in professional_profiles.';
    END;
END;
$$;

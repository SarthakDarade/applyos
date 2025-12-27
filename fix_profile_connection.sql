-- 1. Ensure user_id is unique for UPSERT to work correctly
-- This is critical for the 'onConflict: user_id' clause in the server action
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'professional_profiles_user_id_key'
    ) THEN
        ALTER TABLE public.professional_profiles
        ADD CONSTRAINT professional_profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 2. Enable Row Level Security (Security Best Practice)
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Add Access Policies
-- View: Allow users to see their own profile
DROP POLICY IF EXISTS "Users can view own professional profile" ON public.professional_profiles;
CREATE POLICY "Users can view own professional profile"
ON public.professional_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Insert: Allow users to create their own profile
DROP POLICY IF EXISTS "Users can insert own professional profile" ON public.professional_profiles;
CREATE POLICY "Users can insert own professional profile"
ON public.professional_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update: Allow users to edit their own profile
DROP POLICY IF EXISTS "Users can update own professional profile" ON public.professional_profiles;
CREATE POLICY "Users can update own professional profile"
ON public.professional_profiles FOR UPDATE
USING (auth.uid() = user_id);

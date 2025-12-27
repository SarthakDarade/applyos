-- 1. DROP the unique constraint on user_id to allow multiple resumes per user.
-- Use the correct constraint name. It is typically "resumes_user_id_key".
ALTER TABLE resumes DROP CONSTRAINT IF EXISTS resumes_user_id_key;

-- 2. ADD a title column to specific resume names
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Untitled Resume';

-- 3. Ensure 'id' is the primary key (Standard, but verifying upsert usage)
-- (No action needed if standard UUID PK exists)

-- 4. Enable RLS (Row Level Security) if not already enabled (Best Practice)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- 5. Add Policy for managing own resumes (if not exists)
create policy "Users can manage own resumes"
on resumes for all
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

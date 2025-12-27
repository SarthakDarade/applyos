-- Create internal table for onboarding resumes status
create table if not exists public.onboarding_resumes (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    resume_path text not null,
    internal_status text default 'pending', -- pending | processing | completed | failed
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.onboarding_resumes enable row level security;

-- Policy: Users can insert their own rows (Step 1 triggers this)
create policy "Users can insert own onboarding resumes"
    on public.onboarding_resumes for insert
    with check (auth.uid() = user_id);

-- Policy: Users usually don't need to read this table if it's internal-only, 
-- but might be good for debugging or future status checks.
-- For now, allow select for own user.
create policy "Users can select own onboarding resumes"
    on public.onboarding_resumes for select
    using (auth.uid() = user_id);

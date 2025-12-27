-- 1. Create the job_preferences table
create table if not exists public.job_preferences (
  user_id uuid references auth.users(id) primary key, -- Use user_id as PK to enforce 1 record per user
  roles text[] not null default '{}',
  locations text[] not null default '{}',
  work_styles text[] not null default '{}', -- Remote, Hybrid, On-site
  min_salary integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.job_preferences enable row level security;

-- 3. Create Policies
drop policy if exists "Users can view own preferences" on public.job_preferences;
create policy "Users can view own preferences"
on public.job_preferences for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own preferences" on public.job_preferences;
create policy "Users can insert own preferences"
on public.job_preferences for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.job_preferences;
create policy "Users can update own preferences"
on public.job_preferences for update
using (auth.uid() = user_id);

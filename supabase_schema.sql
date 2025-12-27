-- 1. Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- 2. CREATE POLICIES (Drop first to avoid errors if re-running)

-- Policy: INSERT
drop policy if exists "Users can upload their own resumes" on storage.objects;
create policy "Users can upload their own resumes"
on storage.objects for insert
with check (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: SELECT
drop policy if exists "Users can view their own resumes" on storage.objects;
create policy "Users can view their own resumes"
on storage.objects for select
using (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: UPDATE
drop policy if exists "Users can update their own resumes" on storage.objects;
create policy "Users can update their own resumes"
on storage.objects for update
using (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Create public table for tracking (Safe to run)
create table if not exists public.user_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  file_path text not null,
  file_name text not null,
  status text default 'uploaded',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Enable RLS on the public table (You own this table, so this works)
alter table public.user_resumes enable row level security;

-- 5. DB Policies
drop policy if exists "Users can view own resume records" on public.user_resumes;
create policy "Users can view own resume records"
on public.user_resumes for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own resume records" on public.user_resumes;
create policy "Users can insert own resume records"
on public.user_resumes for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own resume records" on public.user_resumes;
create policy "Users can update own resume records"
on public.user_resumes for update
using (auth.uid() = user_id);

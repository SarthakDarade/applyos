-- FORCE FIX DELETE PERMISSIONS

-- 1. Fix Storage Deletion Policy
drop policy if exists "Users can delete their own resumes" on storage.objects;

create policy "Users can delete their own resumes"
on storage.objects for delete
using (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Fix Database Deletion Policy
drop policy if exists "Users can delete own resume records" on public.user_resumes;

create policy "Users can delete own resume records"
on public.user_resumes for delete
using (auth.uid() = user_id);

-- 3. Verify RLS is enabled
alter table public.user_resumes enable row level security;

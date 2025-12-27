-- Create resumes table
create table public.resumes (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  custom_pdf_url text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint resumes_pkey primary key (id),
  constraint resumes_user_id_key unique (user_id)
);

-- RLS Policies
alter table public.resumes enable row level security;

create policy "Users can view own resume"
on public.resumes for select
using (auth.uid() = user_id);

create policy "Users can insert own resume"
on public.resumes for insert
with check (auth.uid() = user_id);

create policy "Users can update own resume"
on public.resumes for update
using (auth.uid() = user_id);

create policy "Users can delete own resume"
on public.resumes for delete
using (auth.uid() = user_id);

-- Update applications table to link specific resume snapshot
alter table public.applications 
add column if not exists generated_resume_url text;

-- Create Storage Bucket for Resumes if not exists
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Resume Public Access"
on storage.objects for select
using ( bucket_id = 'resumes' );

create policy "Users can upload resumes"
on storage.objects for insert
with check ( bucket_id = 'resumes' and auth.uid() = owner );

create policy "Users can update resumes"
on storage.objects for update
using ( bucket_id = 'resumes' and auth.uid() = owner );

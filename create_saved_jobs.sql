create table public.saved_jobs (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint saved_jobs_pkey primary key (id),
  constraint saved_jobs_user_id_job_id_key unique (user_id, job_id)
);

alter table public.saved_jobs enable row level security;

create policy "Users can view their own saved jobs"
on public.saved_jobs for select
using (auth.uid() = user_id);

create policy "Users can insert their own saved jobs"
on public.saved_jobs for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own saved jobs"
on public.saved_jobs for delete
using (auth.uid() = user_id);

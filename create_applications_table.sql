create table public.applications (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  applied_at timestamp with time zone not null default now(),
  status text not null default 'Applied', -- Applied, Viewed, Interview, Offer, Rejected
  source text not null default 'manual',
  created_at timestamp with time zone not null default now(),
  constraint applications_pkey primary key (id),
  constraint applications_user_id_job_id_key unique (user_id, job_id)
);

alter table public.applications enable row level security;

create policy "Users can view their own applications"
on public.applications for select
using (auth.uid() = user_id);

create policy "Users can insert their own applications"
on public.applications for insert
with check (auth.uid() = user_id);

create policy "Users can update their own applications"
on public.applications for update
using (auth.uid() = user_id);

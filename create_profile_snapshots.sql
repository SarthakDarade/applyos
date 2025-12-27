create table public.profile_snapshots (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users(id),
  completeness_score integer not null default 0,
  health_score integer not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint profile_snapshots_pkey primary key (id)
);

alter table public.profile_snapshots enable row level security;

create policy "Users can view their own profile snapshots"
on public.profile_snapshots for select
using (auth.uid() = user_id);

create policy "Users can insert their own profile snapshots"
on public.profile_snapshots for insert
with check (auth.uid() = user_id);

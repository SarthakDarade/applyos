create table public.user_activity_log (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users(id),
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint user_activity_log_pkey primary key (id)
);

alter table public.user_activity_log enable row level security;

create policy "Users can view their own activity logs"
on public.user_activity_log for select
using (auth.uid() = user_id);

create policy "Users can insert their own activity logs"
on public.user_activity_log for insert
with check (auth.uid() = user_id);

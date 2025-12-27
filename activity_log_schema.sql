-- Create Activity Logs Table
create table if not exists public.user_activity_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  action text not null, -- e.g. "Updated Profile", "Logged In"
  description text null, -- e.g. "Added new skill: PyTorch"
  metadata jsonb default '{}'::jsonb, -- Store extended info (IP, UA, URL, etc)
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.user_activity_log enable row level security;

-- Policies
create policy "Users can view own logs"
  on public.user_activity_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.user_activity_log for insert
  with check (auth.uid() = user_id);
  
-- Index for faster timeline queries
create index if not exists activity_log_user_id_idx on public.user_activity_log (user_id);
create index if not exists activity_log_created_at_idx on public.user_activity_log (created_at desc);

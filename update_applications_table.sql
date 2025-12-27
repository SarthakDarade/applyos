alter table public.applications 
add column if not exists source text not null default 'manual',
add column if not exists created_at timestamp with time zone not null default now();

-- Ensure defaults
alter table public.applications alter column status set default 'Applied';

-- Enable RLS just in case
alter table public.applications enable row level security;

-- Re-create policies (idempotent-ish check)
drop policy if exists "Users can view their own applications" on public.applications;
create policy "Users can view their own applications"
on public.applications for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own applications" on public.applications;
create policy "Users can insert their own applications"
on public.applications for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own applications" on public.applications;
create policy "Users can update their own applications"
on public.applications for update
using (auth.uid() = user_id);

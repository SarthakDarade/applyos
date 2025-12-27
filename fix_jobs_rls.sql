-- Enable RLS (already enabled, but good to be explicit in intention)
alter table public.jobs enable row level security;

-- Create policy to allow anyone to read jobs
create policy "Anyone can read active jobs"
on public.jobs
for select
to public
using (is_active = true);

-- Just in case, grant usage (usually default, but safely ensures it)
grant select on table public.jobs to anon, authenticated;

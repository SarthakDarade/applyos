-- ENHANCE PROFILES TABLE
-- Add columns for richer profile data if they don't exist

alter table public.profiles 
add column if not exists skills text[],
add column if not exists bio text,
add column if not exists linkedin_url text,
add column if not exists portfolio_url text;

-- Add checking for 'current_role' (ensure it exists if we renamed it earlier)
-- If not, re-run rename logic just in case user skipped it
do $$
begin
  if exists(select * from information_schema.columns where table_name = 'profiles' and column_name = 'target_roles') then
    alter table public.profiles rename column target_roles to current_role;
  end if;
end $$;

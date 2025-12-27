-- FIX FOREIGN KEY CONSTRAINT

-- 1. Drop the incorrect FK to 'profiles'
alter table public.job_preferences
drop constraint if exists job_preferences_user_id_fkey;

-- 2. Add correct FK to 'auth.users'
alter table public.job_preferences
add constraint job_preferences_user_id_fkey
foreign key (user_id)
references auth.users(id)
on delete cascade;

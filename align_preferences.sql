-- ALIGN DATABASE SCHEMA with UI

-- 1. Drop existing constraint that limits to single values
alter table public.job_preferences drop constraint if exists job_preferences_job_type_check;

-- 2. Rename column 'job_type' to 'work_styles' and convert to array
-- If data exists, we wrap it in an array. If null, empty array.
alter table public.job_preferences 
rename column job_type to work_styles;

alter table public.job_preferences
alter column work_styles type text[] using 
  case 
    when work_styles is null then '{}'
    else array[work_styles]
  end;

-- 3. Set default to empty array
alter table public.job_preferences 
alter column work_styles set default '{}';

-- 4. Ensure RLS is correct for new schema
-- (Your existing table references 'profiles', we need to ensure auth.uid() can write to it)

-- Fix Policies
drop policy if exists "Users can update own preferences" on public.job_preferences;
create policy "Users can update own preferences"
on public.job_preferences for update
using (auth.uid() = user_id);

drop policy if exists "Users can insert own preferences" on public.job_preferences;
create policy "Users can insert own preferences"
on public.job_preferences for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can view own preferences" on public.job_preferences;
create policy "Users can view own preferences"
on public.job_preferences for select
using (auth.uid() = user_id);

-- 5. Fix Foreign Key if 'profiles' doesn't match auth.users (Optional/Safety)
-- Ideally user_id should reference auth.users directly for simplicity, but if profiles is your arch, ensuring user_id = auth.uid() in policy covers it.

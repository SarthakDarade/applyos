-- Add onboarding tracking to profiles
alter table public.profiles 
add column if not exists onboarding_step integer default 0;

-- Optional: If you want to force all current users to skip onboarding, run this:
-- update public.profiles set onboarding_step = 3; 
-- Or keep 0 to force them through it. I will leave it as default 0.

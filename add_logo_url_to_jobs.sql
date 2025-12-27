alter table public.jobs 
add column if not exists logo_url text;

-- Update existing dummy data with logo URLs
update public.jobs 
set logo_url = 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png'
where company = 'Vercel';

update public.jobs 
set logo_url = 'https://pbs.twimg.com/profile_images/1691118671755132928/s4C4f10i_400x400.jpg' -- Linear logo placeholder
where company = 'Linear';

update public.jobs 
set logo_url = 'https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png'
where company = 'Supabase';

alter table public.jobs 
add column if not exists experience_level text,
add column if not exists skills_required text[] default '{}'::text[],
add column if not exists description text,
add column if not exists is_active boolean default true;

-- Add some dummy data for testing the UI
insert into public.jobs (title, company, location, job_type, experience_level, skills_required, description, apply_url)
values 
('Senior Frontend Engineer', 'Vercel', 'Remote', 'Full-time', 'Senior', ARRAY['React', 'Next.js', 'TailwindCSS'], 'We are looking for a Senior Frontend Engineer to help us build the next generation of our web platform.', 'https://vercel.com/careers'),
('Product Designer', 'Linear', 'San Francisco, CA', 'Full-time', 'Mid-Level', ARRAY['Figma', 'UI/UX', 'Prototyping'], 'Join our design team to craft beautiful and functional user interfaces.', 'https://linear.app/careers'),
('Backend Developer', 'Supabase', 'Remote', 'Contract', 'Junior', ARRAY['PostgreSQL', 'Go', 'Rust'], 'Help us scale our open source database platform.', 'https://supabase.com/careers');

-- RENAME COLUMN for clarity
alter table public.profiles 
rename column target_roles to current_role;

-- If it was text, keep it text. If it was array, keep it array.
-- Let's ensure it handles string data, as 'Current Role' implies a single title usually.
-- But if we want to support multiple (Slash Careers), array is fine. 
-- However, "Current Role" is usually singular in UI. 
-- Let's stick to what it is now (likely text or text[]).

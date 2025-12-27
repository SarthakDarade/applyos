alter table public.applications drop constraint if exists applications_status_check;

alter table public.applications add constraint applications_status_check 
check (status in (
  'applied', 'viewed', 'interview', 'offer', 'rejected', 'ghosted', 
  'Applied', 'Viewed', 'Interview', 'Offer', 'Rejected'
));

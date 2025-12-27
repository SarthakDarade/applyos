create policy "Users can delete their own applications"
on public.applications for delete
using (auth.uid() = user_id);

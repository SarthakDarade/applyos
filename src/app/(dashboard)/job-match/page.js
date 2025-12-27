import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { JobMatchClient } from './job-match-client';
import { ProfileTip } from '@/components/ui/profile-tip';

export default async function JobMatchPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch existing resume data (Single Source of Truth)
    const { data: resume } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // We pass the whole resume object so we have the ID for updates
    // The client component will handle extracting .data
    return (
        <div className="space-y-6">
            <ProfileTip />
            <JobMatchClient resume={resume} />
        </div>
    );
}

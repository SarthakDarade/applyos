import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ResumeDashboard } from '@/components/resume/dashboard/ResumeDashboard';

export const metadata = {
    title: 'My Resumes | ApplyOS',
};

export default async function ResumeDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch all resumes
    let { data: resumes, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    // Fetch Profile for limit checks
    const { data: profile } = await supabase
        .from('professional_profiles')
        .select('subscription_plan')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error("Error fetching resumes:", error);
        resumes = [];
    }

    return <ResumeDashboard resumes={resumes || []} user={user} profile={profile} />;
}

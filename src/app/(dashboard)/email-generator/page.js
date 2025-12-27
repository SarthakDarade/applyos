import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EmailGenerator } from '@/components/email-generator/email-generator';

import { ProfileTip } from '@/components/ui/profile-tip';

export default async function EmailGeneratorPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch resume for "in-memory" usage in the generator
    const { data: resume } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .single();

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 relative">

            {/* Ambient Background */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Profile Tip */}
            <ProfileTip />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        HR Email Generator
                    </h1>
                    <p className="text-neutral-400 mt-2 max-w-2xl text-lg">
                        Draft professional outreach emails in seconds. Tailored to the role, styled for impact.
                    </p>
                </div>
            </div>

            {/* Generator */}
            <EmailGenerator user={user} resume={resume} />
        </div>
    );
}

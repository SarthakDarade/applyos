import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ResumeEditor } from '@/components/resume/editor/ResumeEditor';

export default async function ResumeEditorPage({ params }) {
    const { id } = await params;

    // Validate UUID to prevent DB errors if garbage is passed
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch specific resume
    const { data: resumeRecord, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // Ensure ownership
        .single();

    if (error || !resumeRecord) {
        console.error("Resume fetch error:", error);
        redirect('/resume'); // Redirect to dashboard if not found
    }

    // Pass the full record including ID and Title to the editor
    // Pass as 'resume' prop to be clean
    return <ResumeEditor resume={resumeRecord} user={user} />;
}

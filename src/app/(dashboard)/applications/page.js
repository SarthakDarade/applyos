import { createClient } from '@/lib/supabase/server'
import { ApplicationsView } from '@/components/applications/applications-view'

export const metadata = {
    title: 'My Applications - ApplyOS',
}

export default async function ApplicationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch manual applications
    const { data: manualApps, error: manualError } = await supabase
        .from('manual_applications')
        .select('*')
        .eq('user_id', user.id)

    // Fetch system applications with job details
    const { data: systemApps, error: systemError } = await supabase
        .from('applications')
        .select(`
            *,
            jobs (
                title,
                company,
                logo_url,
                location,
                apply_url
            )
        `)
        .eq('user_id', user.id)

    if (manualError) console.error('Error fetching manual apps:', manualError)
    if (systemError) console.error('Error fetching system apps:', systemError)

    // Merge and normalize data structures
    const allApplications = [
        ...(manualApps || []).map(app => ({
            id: app.id,
            status: app.status,
            applied_at: app.applied_at,
            is_manual: true,
            jobs: {
                title: app.job_title,
                company: app.company_name,
                logo_url: null, // No logo for manual apps
                location: 'Unknown',
                apply_url: app.application_link
            }
        })),
        ...(systemApps || []).map(app => ({
            ...app,
            is_manual: false
        }))
    ].sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <ApplicationsView initialApplications={allApplications} />
        </div>
    )
}

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        // 1. Authenticate Request (Security)
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Parse Payload
        const bodyContent = await request.json()
        console.log('API: Received Body:', bodyContent)
        const { resume_path, resume_id } = bodyContent

        if (!resume_path || !resume_id) {
            console.error('API: Missing params', bodyContent)
            return NextResponse.json({ error: 'Missing resume_path or resume_id' }, { status: 400 })
        }

        // ... ownership check ...
        if (!resume_path.startsWith(user.id)) {
            console.warn(`User ${user.id} attempted to access ${resume_path}`)
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 3. Update Status to Processing (Internal Table)
        await supabase
            .from('onboarding_resumes')
            .update({ internal_status: 'processing' })
            .eq('id', resume_id)

        // 4. Generate Signed URL (Admin Privilege)
        const adminSupabase = createAdminClient()
        const { data: signedData, error: signError } = await adminSupabase
            .storage
            .from('resumes')
            .createSignedUrl(resume_path, 3600)

        if (signError || !signedData?.signedUrl) {
            console.error('Failed to sign URL:', signError)
            await supabase.from('onboarding_resumes').update({ internal_status: 'failed' }).eq('id', resume_id)
            return NextResponse.json({ error: 'Extraction setup failed' }, { status: 500 })
        }

        // 5. Send to n8n Webhook
        const webhookUrl = process.env.N8N_WEBHOOK_URL
        if (!webhookUrl) {
            console.error('Missing N8N_WEBHOOK_URL env var')
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const payload = {
            user_id: user.id,
            resume_id: resume_id, // Internal ID from onboarding_resumes
            signed_url: signedData.signedUrl
        }

        // Fire and forget (or await trigger, but ignore response body)
        try {
            const n8nResponse = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!n8nResponse.ok) {
                throw new Error(`n8n responded with ${n8nResponse.status}`)
            }

            // We do NOT wait for 'completed' status here. n8n does the processing.
            // We just successfully handed it off.
            return NextResponse.json({ success: true })

        } catch (webhookError) {
            console.error('Webhook trigger failed:', webhookError)
            await supabase.from('onboarding_resumes').update({ internal_status: 'failed' }).eq('id', resume_id)
            // Even if it failed internally, we might return 200 to frontend to keep flow moving? 
            // The prompt says "If webhook fails: update internal_status = 'failed'".
            // "System must remain silent". So return 200.
            return NextResponse.json({ success: true, warning: 'Internal processing delayed' })
        }

    } catch (error) {
        console.error('Extraction API Error:', error)
        // TODO: Add error monitoring (Sentry/Datadog)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

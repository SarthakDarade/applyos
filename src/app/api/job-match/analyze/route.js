import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { job } = body;

        // Validation for Job only
        if (!job || !job.description) {
            return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
        }

        const webhookUrl = process.env.N8N_JOB_MATCH_WEBHOOK;
        if (!webhookUrl) {
            console.error("Missing N8N_JOB_MATCH_WEBHOOK env var");
            return NextResponse.json({ error: 'Analysis Service Not Configured' }, { status: 503 });
        }

        // Call N8N with User ID and Job details only (No Resume)
        const n8nResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                job
            })
        });

        if (!n8nResponse.ok) {
            console.error(`N8N Error: ${n8nResponse.status}`);
            return NextResponse.json({ error: "Couldn't analyze this job right now" }, { status: 502 });
        }

        let rawResult;
        try {
            rawResult = await n8nResponse.json();
        } catch (e) {
            console.error("Invalid JSON from N8N", e);
            return NextResponse.json({ error: "Analysis service returned invalid data" }, { status: 502 });
        }

        // Normalize response from N8N
        let data = Array.isArray(rawResult) ? rawResult[0] : rawResult;

        // Unwrap 'output' key if present
        if (data.output) {
            data = data.output;
        }

        // Log Activity for Stats
        try {
            await supabase.from('user_activity_log').insert({
                user_id: user.id,
                action_type: 'job_scan',
                details: { job_title: job.title || 'Unknown Role', company: job.company || 'Unknown Company' }
            });
        } catch (e) {
            console.warn("Failed to log scan activity:", e);
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Job Match API Error:', error);
        return NextResponse.json({ error: "Couldn't analyze this job right now" }, { status: 500 });
    }
}

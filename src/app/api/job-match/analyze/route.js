import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logActivity } from '@/lib/activity-logger';

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
            const errorText = await n8nResponse.text();
            console.error(`N8N Error (${n8nResponse.status}):`, errorText);
            return NextResponse.json({ error: "Couldn't analyze this job right now" }, { status: 502 });
        }

        const responseText = await n8nResponse.text();

        if (!responseText || responseText.trim() === '') {
            console.error("N8N returned an empty response body.");
            return NextResponse.json({
                error: "Analysis service returned no data. It might be overloaded or timed out."
            }, { status: 502 });
        }

        let rawResult;
        try {
            rawResult = JSON.parse(responseText);
        } catch (e) {
            console.error("Invalid JSON from N8N. Raw Text:", responseText);
            return NextResponse.json({
                error: "Analysis service returned invalid data format."
            }, { status: 502 });
        }

        // Normalize response from N8N
        let data = Array.isArray(rawResult) ? rawResult[0] : rawResult;

        if (!data) {
            console.error("N8N response normalization failed. Data is empty.");
            return NextResponse.json({
                error: "Analysis service returned no valid data. Please try again."
            }, { status: 502 });
        }

        // Unwrap 'output' key if present
        if (data.output) {
            data = data.output;
        }

        // Log Activity for Stats using centralized logger
        await logActivity(
            'Job Analysis',
            `Analyzed matching for ${job.title || 'Unknown Role'} at ${job.company || 'Unknown Company'}`,
            { job_title: job.title, company: job.company }
        );

        return NextResponse.json(data);

    } catch (error) {
        console.error('Job Match API Error:', error);
        return NextResponse.json({ error: "Couldn't analyze this job right now" }, { status: 500 });
    }
}

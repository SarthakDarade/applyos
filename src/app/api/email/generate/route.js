import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Limit Check (Optional but recommended)
        try {
            const { checkUsage } = await import('@/lib/limits');
            const limitCheck = await checkUsage(user.id, 'email_gen');
            if (!limitCheck.allowed) {
                return NextResponse.json({
                    error: `Upgrade Required. Email generation is available on the Pro plan.`
                }, { status: 403 });
            }
        } catch (e) {
            console.warn("Limit check skipped:", e.message);
        }

        const body = await request.json();

        // Construct Payload: UserID + Form Data ONLY. 
        // Explicitly exclude any resume data.
        const payload = {
            user: user.id,     // 'user' key holds ID as requested
            user_id: user.id,  // Standard ID key
            job: body.job      // { company, role, description, tone, recipient_name }
        };

        const webhookUrl = process.env.N8N_EMAIL_WEBHOOK || process.env.N8N_EMAIL_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error("Missing N8N_EMAIL_WEBHOOK env var");
            return NextResponse.json({ error: "Service Configuration Error" }, { status: 500 });
        }

        const n8nResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!n8nResponse.ok) {
            console.error(`N8N Error: ${n8nResponse.status}`);
            return NextResponse.json({ error: "Failed to generate email" }, { status: 502 });
        }

        const data = await n8nResponse.json();

        // Normalize response (Array handling)
        let output = Array.isArray(data) ? data[0] : data;
        if (output && output.output) {
            output = output.output;
        }

        return NextResponse.json({
            success: true,
            email: {
                subject: output.subject || "Application",
                body: output.body || ""
            }
        });

    } catch (error) {
        console.error('Email Generator API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

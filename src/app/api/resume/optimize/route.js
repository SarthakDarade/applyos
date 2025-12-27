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
        const { section_key, section_content, job_context } = body;

        if (!section_key) {
            return NextResponse.json({ error: 'Missing section_key' }, { status: 400 });
        }

        const webhookUrl = process.env.N8N_RESUME_OPTIMIZE_WEBHOOK;

        if (!webhookUrl) {
            console.warn("N8N_RESUME_OPTIMIZE_WEBHOOK is not defined");
            // Return original content if no webhook
            return NextResponse.json({ enhanced_content: section_content });
        }

        // Call N8N and wait for response
        const n8nResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                section_key,
                section_content,
                job_context
            })
        });

        if (!n8nResponse.ok) {
            console.error(`N8N webhook failed with status ${n8nResponse.status}`);
            throw new Error(`N8N webhook failed with status ${n8nResponse.status}`);
        }

        const n8nResult = await n8nResponse.json();
        console.log("N8N Result:", n8nResult);

        // Handle nested structure from N8N (e.g. { output: { enhanced_content: ... } })
        const enhancedText = n8nResult.output?.enhanced_content || n8nResult.enhanced_content || section_content;

        // Return enhanced content
        return NextResponse.json({
            enhanced_content: enhancedText
        });

    } catch (error) {
        console.error('Optimize Route Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}

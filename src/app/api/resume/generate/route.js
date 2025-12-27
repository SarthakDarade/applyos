import { NextResponse } from 'next/server';
import { generateLaTeX } from '@/lib/latex-generator';
// Force re-resolve

export async function POST(request) {
    try {
        const body = await request.json();
        const { resumeData, userId } = body;

        // Limit Check
        const { checkUsage } = await import('@/lib/limits');
        const limitCheck = await checkUsage(userId, 'resume_gen');
        if (!limitCheck.allowed) {
            return NextResponse.json({
                error: "Limit Reached", // Helper for client-side check
                message: `Limit reached. You can create ${limitCheck.limit} resume per month on the Free plan. Upgrade to Pro for unlimited PDF downloads.`,
                success: false
            }, { status: 403 })
        }

        // 1. Generate LaTeX Source
        const latexSource = generateLaTeX(resumeData);

        // 2. (Optional/Stub) Compile to PDF
        // Since we are in a serverless environment without pdflatex,
        // we can try a public API or just return the source for now.
        // For a hacky "Perfect PDF" without servers, we can use latexonline.cc

        // Note: Sending data to 3rd party public API has privacy implications. 
        // For this demo/personal tool, it might be acceptable if user consents (or we warn).
        // Let's implement the fetch from latexonline.cc as a "Try It" feature.

        let pdfUrl = null;
        try {
            // Basic attempt to fetch PDF buffer from latexonline
            const response = await fetch(`https://latexonline.cc/compile?text=${encodeURIComponent(latexSource)}`);
            if (response.ok) {
                const pdfBuffer = await response.arrayBuffer();

                // 2a. Track Usage (Insert into user_resumes)
                const { createClient } = require('@supabase/supabase-js');
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                );
                // We need to track this 'generation' event.
                // Assuming 'user_resumes' is the table for tracking generations/resumes.
                await supabase.from('user_resumes').insert({
                    user_id: userId,
                    content: { ...resumeData }, // Store snapshot
                    created_at: new Date().toISOString()
                });

                // Upload to Supabase Storage - SKIP for now, just return base64

                // Return the Base64 PDF to the client
                const base64Pdf = Buffer.from(pdfBuffer).toString('base64');
                return NextResponse.json({
                    success: true,
                    source: latexSource,
                    pdfBase64: base64Pdf,
                    message: "PDF Generated via LaTeX"
                });
            }
        } catch (compileError) {
            console.error("LaTeX Compilation Failed:", compileError);
        }

        // Fallback: Return Source only
        return NextResponse.json({
            success: true,
            source: latexSource,
            url: null,
            message: "LaTeX Source Generated (Compilation Failed or Skipped)"
        });

    } catch (error) {
        console.error("Generate Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

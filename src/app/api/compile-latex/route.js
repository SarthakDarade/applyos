import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { source } = await request.json();

        if (!source) {
            return NextResponse.json({ error: 'Source code is required' }, { status: 400 });
        }

        let errors = [];

        // STRATEGY: YtoTech (latex-on-http) - Dedicated Compiler
        // This is robust because it uses standard JSON, no Multipart boundary issues, and dedicated infrastructure.
        try {
            console.log("Attempting YtoTech compilation...");
            const response = await fetch('https://latex.ytotech.com/builds/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    compiler: "pdflatex",
                    resources: [
                        {
                            main: true,
                            path: "main.tex",
                            content: source
                        }
                    ]
                })
            });

            if (response.ok) {
                const pdfBuffer = await response.arrayBuffer();

                // Sanity check checks for valid PDF header or reasonable size
                if (pdfBuffer.byteLength < 500) {
                    const text = new TextDecoder().decode(pdfBuffer);
                    throw new Error(`Received invalid/empty PDF buffer. Content: ${text.substring(0, 100)}`);
                }

                return new NextResponse(pdfBuffer, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="resume.pdf"'
                    }
                });
            } else {
                const errText = await response.text();
                throw new Error(`YtoTech Failed (${response.status}): ${errText.substring(0, 300)}`);
            }
        } catch (e) {
            console.warn("YtoTech error:", e);
            errors.push(`YtoTech: ${e.message}`);
        }

        // FALLBACK: LatexOnline GET (Last Resort)
        try {
            console.log("Attempting LatexOnline GET...");
            const encoded = encodeURIComponent(source);
            const response = await fetch(`https://latexonline.cc/compile?text=${encoded}&command=pdflatex`, { method: 'GET' });

            if (response.ok) {
                const pdfBuffer = await response.arrayBuffer();
                if (pdfBuffer.byteLength > 500) {
                    return new NextResponse(pdfBuffer, {
                        headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="resume.pdf"' }
                    });
                }
            } else {
                const txt = await response.text();
                errors.push(`LatexOnline (GET): ${response.status} - ${txt.substring(0, 100)}`);
            }
        } catch (e) {
            errors.push(`LatexOnline: ${e.message}`);
        }

        // Output combined errors
        return NextResponse.json({
            error: 'PDF Compilation Failed',
            details: `We tried multiple servers but all failed. Please check your LaTeX syntax manually or try again later.\n\nErrors:\n${errors.join('\n\n')}`
        }, { status: 500 });

    } catch (error) {
        console.error("Compilation Error:", error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message || 'Unknown error'
        }, { status: 500 });
    }
}


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

        // --- LIMIT CHECK ---
        const { data: profile } = await supabase
            .from('professional_profiles')
            .select('subscription_plan')
            .eq('user_id', user.id)
            .single();

        const isPro = profile?.subscription_plan === 'pro';

        if (!isPro) {
            const { count } = await supabase
                .from('user_activity_log')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('action', 'Resume Tailoring');

            if (count >= 2) {
                return NextResponse.json({
                    error: 'Limit Reached: Free users can only generate 2 tailored resumes. Upgrade to Pro for unlimited tailoring and AI power.'
                }, { status: 403 });
            }
        }
        // -------------------

        const body = await request.json();
        const { resume_data, job_requirements, job_title = '', company_name = '' } = body;

        if (!resume_data || !job_requirements) {
            return NextResponse.json({ error: 'Missing resume data or job requirements' }, { status: 400 });
        }

        const webhookUrl = process.env.N8N_RESUME_TAILOR_WEBHOOK;

        if (!webhookUrl) {
            console.error("Missing N8N_RESUME_TAILOR_WEBHOOK env var");
            return NextResponse.json({ error: 'Tailoring Service Not Configured' }, { status: 503 });
        }

        // The exact prompt specified by the user
        const SYSTEM_PROMPT = `
You are building the Resume Generation Engine for ApplyOS.

GOAL:
Generate a job-specific resume for the role of ${job_title || 'a Candidate'} at ${company_name || 'the Target Company'} using:
- Verified user resume data
- Parsed job requirements (${job_title ? `Target Role: ${job_title}` : ''})

The system must create a tailored resume WITHOUT inventing or exaggerating facts.

-----------------------------------
CORE RULES (NON-NEGOTIABLE)
-----------------------------------

- Do NOT add new skills
- Do NOT fabricate metrics
- Do NOT change titles or dates
- Do NOT keyword-stuff
- Do NOT rewrite entire resume blindly

-----------------------------------
RESUME DECISION LOGIC
-----------------------------------

Based on job requirements, decide:

1. Section ordering
   - Reorder sections for relevance
   - Keep template structure intact (valid keys: summary, experience, education, skills, projects, achievements, internships, hackathons)

2. Bullet prioritization
   - Rank bullets by relevance to ${job_title || 'the job'}
   - Move high-relevance bullets upward
   - Suppress low-signal bullets (keep them but move to bottom or omit if strictly irrelevant)

3. Skill grouping
   - Select relevant skill groups
   - Deprioritize unrelated skills

4. Summary framing
   - Adjust emphasis only to align with being a ${job_title || 'candidate'} at ${company_name || 'this company'}
   - Preserve factual meaning
   - Max 2–3 lines

-----------------------------------
OUTPUT FORMAT (JSON)
-----------------------------------

Output a Resume Decision Map matching this exact JSON structure:

{
  "value_proposition": ["Key strength 1 relative to job", "Key strength 2", "Key strength 3"],
  "section_order": ["summary", "experience", ...],
  "prioritized_bullets": {
     "experience.0.description": ["Most relevant bullet", "Next bullet"],
     "projects.0.description": [...]
  },
  "visible_skill_groups": ["Group Name 1", ...],
  "achievements": ["Achievement 1", "Achievement 2"],
  "summary_variant": "New refined summary text..."
}
`;

        const n8nResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                resume_data,
                job_requirements,
                job_title,
                company_name,
                system_prompt: SYSTEM_PROMPT
            })
        });

        if (!n8nResponse.ok) {
            const errorText = await n8nResponse.text();
            console.error('N8N Webhook Error Response:', errorText);
            throw new Error(`Tailoring service failed: ${n8nResponse.status} ${n8nResponse.statusText}`);
        }

        const rawText = await n8nResponse.text();
        let result;
        try {
            result = JSON.parse(rawText);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Raw:", rawText);
            throw new Error(`Sorry for inconvenience, Please retry again.`);
        }

        // Parse n8n response format: [{ output: { ... } }]
        let rawOutput = {};

        if (Array.isArray(result) && result[0]?.output) {
            rawOutput = result[0].output;
        } else if (result.output) {
            rawOutput = result.output;
        } else {
            // Fallback: assume the root object is the output
            rawOutput = result;
        }

        const decision_map = {
            summary_variant: rawOutput.summary || '',

            // Pass raw output for robust frontend merging (Preferred Way)
            structured_tailoring: rawOutput,
            career_objective: rawOutput.career_objective, // Array of strings
            value_to_role: rawOutput.value_to_role,       // Array of strings
            skills: rawOutput.skills,                     // Array of objects

            prioritized_bullets: {},
            visible_skill_groups: [],
            section_order: []
        };

        // Map Experience array to bullets
        if (Array.isArray(rawOutput.experience)) {
            rawOutput.experience.forEach((item, index) => {
                // Expects item.tailored_bullets (Array of strings)
                if (item.tailored_bullets && Array.isArray(item.tailored_bullets)) {
                    decision_map.prioritized_bullets[`experience.${index}`] = {
                        description: item.tailored_bullets,
                        role: item.role,
                        company: item.company
                    };
                }
            });
        }

        // Map Projects array to bullets
        if (Array.isArray(rawOutput.projects)) {
            rawOutput.projects.forEach((item, index) => {
                // Expects item.tailored_description (String)
                if (item.tailored_description) {
                    decision_map.prioritized_bullets[`projects.${index}`] = {
                        description: item.tailored_description,
                        title: item.name
                    };
                }
            });
        }

        // Map Achievements if present
        if (Array.isArray(rawOutput.achievements)) {
            rawOutput.achievements.forEach((item, index) => {
                // Expects item to be a string directly, or obj with tailored_description
                const content = typeof item === 'string' ? item : (item.tailored_description || item.description || '');
                if (content) {
                    decision_map.prioritized_bullets[`achievements.${index}`] = {
                        description: content
                    };
                }
            });
        }

        // Log Activity for Stats
        await logActivity(
            'Resume Tailoring',
            `Tailored resume for ${job_title || 'Role'} at ${company_name || 'Company'}`,
            { job_title, company_name }
        );

        return NextResponse.json({ decision_map });

    } catch (error) {
        console.error('Tailor Route Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

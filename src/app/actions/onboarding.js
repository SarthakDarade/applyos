'use server'

import { createClient } from '@/lib/supabase/server'

export async function extractResumeData(resumeId) {
    if (!resumeId) throw new Error('No resume ID provided')

    // In a real app, this would:
    // 1. Fetch PDF from Storage
    // 2. Send to OpenAI/Gemini
    // 3. Return JSON

    // SIMULATION (Mock AI)
    await new Promise(resolve => setTimeout(resolve, 2500)) // Fake latency

    // Determine "AI" results
    return {
        success: true,
        data: {
            full_name: "Extracted Name", // In real app, parse from PDF
            location: "New York, NY",
            current_role: "Senior Developer",
            experience_years: 5,
            skills: ["JavaScript", "React", "Node.js", "SQL", "Team Leadership"],
            bio: "Experienced developer with a passion for building scalable web applications."
        }
    }
}

export async function saveEnhancedProfile(formData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const rawSkills = formData.get('skills')

    const profileData = {
        full_name: formData.get('full_name'),
        location: formData.get('location'),
        current_role: formData.get('current_role'), // Will be Auto-wrapped to Array by existing logic or stored as string depending on column type. 
        // Let's stick to STRING for simplicity, or SINGLE-ITEM ARRAY if column is Array.
        // I'll use the cleaner approach: let Supabase handle the type based on Schema. 
        // Actually, I need to match the previous action's logic to avoid errors.
        current_role: [formData.get('current_role')],
        experience_years: parseInt(formData.get('experience_years') || '0'),
        bio: formData.get('bio'),
        skills: rawSkills ? rawSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        updated_at: new Date().toISOString()
    }

    const { error } = await supabase
        .from('professional_profiles')
        .upsert({ user_id: user.id, ...profileData }, { onConflict: 'user_id' })

    if (error) {
        console.error('Save profile failed:', error)
        throw new Error(error.message)
    }

    // Sync Auth Meta
    await supabase.auth.updateUser({ data: { full_name: profileData.full_name } })

    // Update Onboarding Progress (Step 2 Completed)
    await supabase.from('professional_profiles').update({ onboarding_step: 2 }).eq('user_id', user.id)

    return { success: true }
}

export async function updateOnboardingStep(step) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    await supabase.from('professional_profiles').update({ onboarding_step: step }).eq('user_id', user.id)
    return { success: true }
}

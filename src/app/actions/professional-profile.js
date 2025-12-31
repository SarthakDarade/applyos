'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logActivity } from '@/lib/activity-logger'

export async function updateProfessionalProfile(userId, data) {
    const supabase = await createClient()

    // Validate authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
        throw new Error('Unauthorized')
    }

    try {
        // Derive current_position from work_experience if available
        let currentPosition = data.current_position || {}
        if (Array.isArray(data.work_experience)) {
            const currentRole = data.work_experience.find(role => role.current === true)
            if (currentRole) {
                currentPosition = currentRole
            }
        }

        // Construct Unified Resume Data
        const resumeData = {
            personal: {
                name: data.full_name || '',
                email: data.email || '',
                phone: data.phone || '',
                linkedin: data.linkedin || '',
                url: data.website || '',
                location: data.location || '',
                title: data.headline || ''
            },
            summary: data.professional_summary || '',
            experience: data.work_experience || [],
            education: data.education || [],
            skills: data.skills || [],
            projects: data.projects || [],
            achievements: data.achievements || [],
            languages: data.languages || [],
            interests: data.interests || []
        }

        const { error } = await supabase
            .from('professional_profiles')
            .upsert({
                user_id: userId,
                ...data, // Keep legacy columns in sync
                resume_data: resumeData,
                current_position: currentPosition,
                onboarding_step: 3, // Mark as complete when saved through /profile or onboarding form
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })

        if (error) {
            console.error('Supabase Upsert Error:', error)
            throw new Error(error.message || 'Database error during profile update')
        }

        revalidatePath('/profile')
        // Also revalidate settings as it depends on this data
        revalidatePath('/settings')

        // Log Activity
        await logActivity('Updated Profile', 'Saved changes to professional profile details')

        return { success: true }
    } catch (error) {
        console.error('Failed to update profile:', error)
        return { success: false, error: error.message }
    }
}

export async function addSkillToProfile(userId, skill) {
    try {
        const current = await getProfessionalProfile(userId);
        const profile = current || { user_id: userId, skills: [] };

        const skills = Array.isArray(profile.skills) ? [...profile.skills] : [];

        // Check for duplicates (Simple string check)
        const exists = skills.some(s => {
            if (typeof s === 'string') return s.toLowerCase() === skill.toLowerCase();
            return false;
        });

        if (exists) {
            return { success: false, message: 'Skill already exists in profile' };
        }

        skills.push(skill);

        return await updateProfessionalProfile(userId, { ...profile, skills });
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getProfessionalProfile(userId) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching profile:', error)
    }

    return data
}

export async function deleteAccount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const adminSupabase = createAdminClient()

    // 1. Delete Storage Files (Resumes)
    const { data: files } = await adminSupabase
        .storage
        .from('resumes')
        .list(`${user.id}`)

    if (files?.length > 0) {
        const pathsToDelete = files.map(f => `${user.id}/${f.name}`)
        await adminSupabase.storage.from('resumes').remove(pathsToDelete)
    }

    // 2. Delete Database Records (Manual Cascade for reliability)
    await adminSupabase.from('user_resumes').delete().eq('user_id', user.id)
    await adminSupabase.from('job_preferences').delete().eq('user_id', user.id)
    await adminSupabase.from('professional_profiles').delete().eq('user_id', user.id)

    // 3. Delete Auth User (Final Step)
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

    if (error) {
        console.error('Account deletion failed:', error)
        throw new Error(error.message || 'Failed to delete account')
    }

    redirect('/login')
}

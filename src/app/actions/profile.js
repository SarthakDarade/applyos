'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const full_name = formData.get('full_name')
    const location = formData.get('location')
    const current_role = formData.get('current_role')
    const experience_years = formData.get('experience_years')

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name,
            location,
            // DB column 'current_role' (renamed from target_roles) is likely still text[] (Array).
            // Since "Current Role" is singular, we wrap it in an array to satisfy the type.
            current_role: current_role ? [current_role] : [],
            experience_years: parseInt(experience_years || '0'),
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Profile update failed:', error)
        throw new Error(error.message || 'Failed to update profile')
    }

    // Sync full_name to Auth Metadata (Best Practice)
    if (full_name) {
        const { error: authError } = await supabase.auth.updateUser({
            data: { full_name: full_name }
        })
        if (authError) console.warn('Failed to sync auth metadata:', authError)
    }

    revalidatePath('/settings')
    return { success: true }
}

export async function deleteAccount() {
    const supabase = await createClient() // Auth client to get current user ID safely
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Use Admin Client for deletion (Privileged op)
    const adminSupabase = createAdminClient()

    // 1. Delete Storage Files (Resumes)
    // We list them first because we need specific paths, but simple bucket delete usually works if permissions allow.
    // Easiest way with admin: list contents of folder and remove.
    const { data: files } = await adminSupabase
        .storage
        .from('resumes')
        .list(`${user.id}`)

    if (files?.length > 0) {
        const pathsToDelete = files.map(f => `${user.id}/${f.name}`)
        await adminSupabase.storage.from('resumes').remove(pathsToDelete)
    }

    // 2. Delete Database Records (Manual Cascade)
    // We do this manually to avoid "Database error deleting user" if FK constraints aren't set to CASCADE perfectly.

    // Delete user_resumes
    const { error: resumeDbError } = await adminSupabase.from('user_resumes').delete().eq('user_id', user.id)
    if (resumeDbError) console.error('Error deleting user_resumes:', resumeDbError)

    // Delete job_preferences
    const { error: prefError } = await adminSupabase.from('job_preferences').delete().eq('user_id', user.id)
    if (prefError) console.error('Error deleting job_preferences:', prefError)

    // Delete profiles
    const { error: profileError } = await adminSupabase.from('profiles').delete().eq('id', user.id)
    if (profileError) console.error('Error deleting profiles:', profileError)

    // 3. Delete Auth User (Final Step)
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

    if (error) {
        console.error('Account deletion failed:', error)
        throw new Error(error.message || 'Failed to delete account')
    }

    // 3. User is gone. Redirect to login.
    redirect('/login')
}

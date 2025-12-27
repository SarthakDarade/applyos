'use server';

import { createClient } from '@/lib/supabase/server';
import { checkUsage } from '@/lib/limits';
import { revalidatePath } from 'next/cache';

export async function addApplication(formData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // Limit Check
    const limitCheck = await checkUsage(user.id, 'applications');
    if (!limitCheck.allowed) {
        return {
            success: false,
            error: `Limit reached. You have tracked ${limitCheck.count}/${limitCheck.limit} applications. \nUpgrade to Pro for unlimited tracking.`
        };
    }

    // Process Date
    const applied_at = formData.get('applied_at') || new Date().toISOString();

    const { error } = await supabase
        .from('manual_applications')
        .insert({
            user_id: user.id,
            company_name: formData.get('company'),
            job_title: formData.get('title'),
            platform: formData.get('platform'),
            application_link: formData.get('application_link'),
            application_id_ref: formData.get('application_id'),
            status: formData.get('status'),
            applied_at: applied_at
        });

    if (error) {
        console.error("Add App Error:", error);
        return { success: false, error: 'Failed to save application.' };
    }

    revalidatePath('/applications');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function updateApplication(formData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const id = formData.get('id');
    const isManual = formData.get('is_manual') === 'true';
    const status = formData.get('status');

    if (isManual) {
        // Update Manual Application (All fields)
        const { error } = await supabase
            .from('manual_applications')
            .update({
                company_name: formData.get('company'),
                job_title: formData.get('title'),
                platform: formData.get('platform'),
                application_link: formData.get('application_link'),
                application_id_ref: formData.get('application_id'),
                status: status,
                applied_at: formData.get('applied_at')
            })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) return { success: false, error: error.message };
    } else {
        // Update System Application (Status only for now)
        const { error } = await supabase
            .from('applications')
            .update({
                status: status
            })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) return { success: false, error: error.message };
    }

    revalidatePath('/applications');
    revalidatePath('/dashboard');
    return { success: true };
}

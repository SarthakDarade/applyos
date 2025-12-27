import { createClient } from '@/lib/supabase/server';

export const LIMITS = {
    free: {
        job_match: 5,         // Monthly
        resume_storage: 3,    // Total
        email_gen: 0,       // Virtually unlimited
        tailor_resume: 0    // Virtually unlimited
    },
    pro: {
        job_match: Infinity,
        resume_storage: Infinity,
        email_gen: Infinity,
        tailor_resume: Infinity
    }
};

export async function checkUsage(userId, feature) {
    const supabase = await createClient();

    // 1. Get User Plan
    const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', userId)
        .single();

    const plan = sub?.plan_id || 'free';
    const limit = LIMITS[plan] ? LIMITS[plan][feature] : LIMITS['free'][feature];

    if (limit === Infinity) return { allowed: true, plan, count: 0, limit };

    // 2. Count Usage based on feature
    let count = 0;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthStr = startOfMonth.toISOString();

    try {
        if (feature === 'job_match') {
            // Count monthly scans from activity log
            const { count: c } = await supabase
                .from('user_activity_log')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('action_type', 'job_scan')
                .gte('created_at', startOfMonthStr);
            count = c || 0;
        }
        else if (feature === 'resume_storage') {
            const { count: c } = await supabase
                .from('resumes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);
            count = c || 0;
        }
        else if (feature === 'email_gen' || feature === 'tailor_resume') {
            // Currently not tracking counts for these freely allowed tools
            // Return 0 so it passes the < limit check
            count = 0;
        }

    } catch (e) {
        console.error("Error checking limits:", e);
        return { allowed: false, error: true };
    }

    return {
        allowed: count < limit,
        plan,
        count,
        limit
    };
}

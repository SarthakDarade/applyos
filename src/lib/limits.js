import { createClient } from '@/lib/supabase/server';

export const LIMITS = {
    free: {
        job_match: 5,
        resume_gen: 1,
        applications: 5,
        email_gen: 0
    },
    pro: {
        job_match: Infinity,
        resume_gen: Infinity,
        applications: Infinity,
        email_gen: Infinity
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

    // Default to free if no profile/plan
    const plan = sub?.plan_id || 'free';
    const limit = LIMITS[plan] ? LIMITS[plan][feature] : LIMITS['free'][feature]; // Safety check if plan is weird

    if (limit === Infinity) return { allowed: true, plan, count: 0, limit };
    if (limit === 0) return { allowed: false, plan, count: 0, limit };

    // 2. Count Usage based on feature
    let count = 0;

    try {
        if (feature === 'job_match') {
            const { count: c } = await supabase
                .from('job_match_scans')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);
            count = c || 0;
        }
        else if (feature === 'resume_gen') {
            const { count: c } = await supabase
                .from('user_resumes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);
            count = c || 0;
        }
        else if (feature === 'applications') {
            const { count: c1 } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            const { count: c2 } = await supabase
                .from('manual_applications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            count = (c1 || 0) + (c2 || 0);
        }
        else if (feature === 'email_gen') {
            // We don't track email gen counts in a table yet? 
            // Logic says access is 0 for free. If pro, allowed.
            // If we want to allow >0 for free, we need a table to track it.
            // For now, free limit is 0, so we just return allowed=false above.
            // If pro, allowed=true above.
            // So this block might not be reached if limit is 0 or Infinity.
            // But for robustness:
            return { allowed: plan === 'pro', plan, count: 0, limit };
        }

    } catch (e) {
        console.error("Error checking limits:", e);
        // Fail safe: Allow if error? Or block? Block is safer for paid features.
        return { allowed: false, error: true };
    }

    return {
        allowed: count < limit,
        plan,
        count,
        limit
    };
}

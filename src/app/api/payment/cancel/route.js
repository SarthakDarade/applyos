import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function POST(req) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: sub } = await supabase
            .from('subscriptions')
            .select('razorpay_subscription_id')
            .eq('user_id', user.id)
            .single();

        if (!sub?.razorpay_subscription_id) {
            return NextResponse.json({ error: 'No active subscription found.' }, { status: 400 });
        }

        // Cancel Subscription
        try {
            await razorpay.subscriptions.cancel(sub.razorpay_subscription_id);
        } catch (razorpayError) {
            console.error("Razorpay Cancel Error:", razorpayError);
            // Even if Razorpay fails (e.g. already cancelled), we update DB if needed.
            if (!razorpayError.error || razorpayError.error.code !== 'BAD_REQUEST_ERROR') {
                // If it's not "already cancelled" or similar bad request, throw.
                throw razorpayError;
            }
        }

        // Downgrade User
        const { error } = await supabase
            .from('subscriptions')
            .update({
                plan_id: 'free',
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

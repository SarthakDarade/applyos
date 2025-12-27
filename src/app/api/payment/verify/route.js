import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const body = await req.json();
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify Signature
        // Signature = hmac_sha256(razorpay_payment_id + "|" + razorpay_subscription_id, secret);
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_payment_id + '|' + razorpay_subscription_id)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
        }

        // Update DB
        // Update DB
        const { error } = await supabase
            .from('subscriptions')
            .update({
                plan_id: 'pro',
                status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Payment Verify Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

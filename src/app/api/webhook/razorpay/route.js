import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Skip verification if secret not set (dev mode caution)
        if (secret) {
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(rawBody)
                .digest('hex');

            if (expectedSignature !== signature) {
                return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
            }
        }

        const event = JSON.parse(rawBody);
        const { payload } = event;

        // Initialize Admin Client
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        console.log(`Received Webhook: ${event.event}`);

        if (event.event === 'subscription.activated') {
            const subscriptionId = payload.subscription.entity.id;
            const { error } = await supabase
                .from('subscriptions')
                .update({ plan_id: 'pro', status: 'active', updated_at: new Date().toISOString() })
                .eq('razorpay_subscription_id', subscriptionId);

            if (error) console.error("Activation DB Error:", error);
        }
        else if (event.event === 'subscription.cancelled' || event.event === 'subscription.completed') {
            const subscriptionId = payload.subscription.entity.id;
            await supabase
                .from('subscriptions')
                .update({ plan_id: 'free', status: 'cancelled', updated_at: new Date().toISOString() })
                .eq('razorpay_subscription_id', subscriptionId);
        }
        else if (event.event === 'payment.failed') {
            // Handle failed payment for subscription
            const subscriptionId = payload.payment?.entity?.subscription_id;
            if (subscriptionId) {
                await supabase
                    .from('subscriptions')
                    .update({ status: 'failed', plan_id: 'free', updated_at: new Date().toISOString() }) // Revoke access on failure
                    .eq('razorpay_subscription_id', subscriptionId);
            }
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Webhook Processing Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

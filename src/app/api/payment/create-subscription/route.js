import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function POST(req) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get current subscription info
        const { data: sub } = await supabase
            .from('subscriptions')
            .select('razorpay_customer_id')
            .eq('user_id', user.id)
            .single();

        let customerId = sub?.razorpay_customer_id;

        if (!customerId) {
            // Fallback: Check if cached in profile (legacy) or just fetch name
            const { data: profile } = await supabase
                .from('professional_profiles')
                .select('full_name, razorpay_customer_id')
                .eq('user_id', user.id)
                .single();

            // Use legacy customer ID if it exists and wasn't found in subscriptions
            if (profile?.razorpay_customer_id) {
                customerId = profile.razorpay_customer_id;
                // Migrate it to subscriptions immediately
                await supabase.from('subscriptions').upsert({
                    user_id: user.id,
                    razorpay_customer_id: customerId
                }, { onConflict: 'user_id' });
            } else {
                // Create New Customer
                try {
                    const customer = await razorpay.customers.create({
                        name: profile?.full_name || 'User',
                        email: user.email,
                        fail_existing: 0,
                    });
                    customerId = customer.id;

                    // Save to DB
                    await supabase
                        .from('subscriptions')
                        .upsert({ user_id: user.id, razorpay_customer_id: customerId }, { onConflict: 'user_id' });

                } catch (err) {
                    console.error("Razorpay Customer Create Error:", err);
                    // Recover existing
                    const customers = await razorpay.customers.all({ email: user.email });
                    if (customers.items.length > 0) {
                        customerId = customers.items[0].id;
                        await supabase
                            .from('subscriptions')
                            .upsert({ user_id: user.id, razorpay_customer_id: customerId }, { onConflict: 'user_id' });
                    } else {
                        throw err;
                    }
                }
            }
        }

        // Create Subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_id: customerId,
            total_count: 120, // 10 years
            quantity: 1,
            notes: { user_id: user.id }
        });

        // Save Subscription ID to subscriptions table
        await supabase
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                razorpay_customer_id: customerId,
                razorpay_subscription_id: subscription.id,
                status: 'created',
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            console.error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID");
            return NextResponse.json({ error: "Server Configuration Error: Missing Razorpay Key" }, { status: 500 });
        }

        return NextResponse.json({
            subscription_id: subscription.id,
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Subscription Create Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

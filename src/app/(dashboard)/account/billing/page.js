import { createClient } from '@/lib/supabase/server';
import { BillingClient } from '@/components/account/billing-client';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Billing - ApplyOS',
}

export default async function BillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Billing</h1>
                <p className="text-neutral-400 mt-1">Manage your subscription and usage.</p>
            </div>
            <BillingClient profile={profile} subscription={subscription} />
        </div>
    );
}

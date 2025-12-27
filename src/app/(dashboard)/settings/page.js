import { createClient } from '@/lib/supabase/server'
import { ProfileSummary } from '@/components/dashboard/profile-summary'
import { SignOutButton } from '@/components/layout/signout-button'
import { DeleteAccount } from '@/components/dashboard/delete-account'
import { Shield, HelpCircle, FileText, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BillingClient } from '@/components/account/billing-client';

export const metadata = {
    title: 'Settings - ApplyOS',
}

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch full profile data to pass to summary
    // Fetch professional profile first (New Source of Truth)
    let { data: profile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    // Fallback to old profile if not found
    if (!profile) {
        const { data: oldProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        profile = oldProfile
    }

    const isPro = profile?.subscription_plan === 'pro';

    return (
        <div className="max-w-2xl mx-auto space-y-12 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-neutral-400 mt-1">Manage your account and privacy.</p>
            </div>

            {/* 0. Subscription Status */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Subscription</h2>
                </div>

                <BillingClient profile={profile} />
            </section>

            {/* 1. Account Identity */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Profile</h2>
                    <Link href="/profile" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Edit Details
                    </Link>
                </div>
                <ProfileSummary user={user} profile={profile} />
            </section>

            {/* 2. Privacy Info */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Privacy & Trust</h2>

                <div className="glass-panel p-6 rounded-xl space-y-4">
                    <div className="flex items-start gap-4">
                        <Shield className="h-5 w-5 text-emerald-400 mt-0.5" />
                        <div>
                            <h3 className="text-white font-medium text-sm">Data Privacy Promise</h3>
                            <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
                                Your resume and profile data are processed securely. We only use your data to apply for jobs you explicitly target. We never sell your personal information.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex items-start gap-4">
                        <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                            <h3 className="text-white font-medium text-sm">Resume Security</h3>
                            <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
                                Uploaded resumes are stored in encrypted private buckets. Only our AI agents have temporary access during the application process.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Support */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Support</h2>
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-neutral-500" />
                        <span className="text-sm text-neutral-200">Need help with your account?</span>
                    </div>
                    <Link href="/contact">
                        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-neutral-300 hover:text-white">
                            Contact Support
                        </Button>
                    </Link>
                </div>
            </section>

            {/* 4. Danger Zone */}
            <section className="space-y-4 pt-4">
                <h2 className="text-sm font-medium text-red-500/80 uppercase tracking-wide">Danger Zone</h2>
                <DeleteAccount />
            </section>

            <section className="pt-8 border-t border-white/5">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-neutral-600 font-mono">ID: {user?.id.split('-')[0]}...</p>
                    <SignOutButton />
                </div>
            </section>
        </div>
    )
}

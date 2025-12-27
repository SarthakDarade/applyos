'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/dashboard/profile-form'
import { getProfessionalProfile } from '@/app/actions/professional-profile'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
    const router = useRouter()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function init() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Fetch profile if exists, to pre-fill
            const p = await getProfessionalProfile(user.id)
            // Even if empty, pass user_id so form knows who to update
            setProfile(p || { user_id: user.id })
            setLoading(false)
        }
        init()
    }, [router])

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                    Complete Your Profile
                </h1>
                <p className="text-neutral-400">
                    Tell us about your professional background to get the most out of ApplyOS.
                </p>
            </div>

            {/* Profile Form Container */}
            <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-1 md:p-2 backdrop-blur-sm">
                <ProfileForm
                    profile={profile}
                    onSuccess={() => {
                        // On successful save, redirect to dashboard
                        router.push('/dashboard')
                    }}
                />
            </div>
        </div>
    )
}

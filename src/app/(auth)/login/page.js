import { Form } from './form'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
    title: 'Login - ApplyOS',
}

export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_step')
            .eq('id', user.id)
            .single()

        if (profile?.onboarding_step >= 3) {
            redirect('/dashboard')
        } else {
            redirect('/onboarding')
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background glow for ambience */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[80px] -z-10" />

            <div className="glass p-8 sm:p-12 rounded-2xl w-full max-w-md space-y-8 relative z-10">
                <div className="text-center">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-white inline-block mb-2">
                        ApplyOS
                    </Link>
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-200">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500">
                        Sign in with your email or phone number.
                    </p>
                </div>

                <Form />

                <p className="mt-4 text-center text-xs text-neutral-600">
                    By signing in, you agree to our Terms of Service.
                </p>
            </div>
        </div>
    )
}

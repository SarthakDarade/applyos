import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    // ULTIMATE REDIRECT FIX:
    // If we're not on localhost, we MUST be on the production site.
    let redirectBase = origin
    if (process.env.NODE_ENV === 'production' || (!origin.includes('localhost') && !origin.includes('127.0.0.1'))) {
        redirectBase = 'https://applyos.pro'
    }

    // Allow manual override via Env Var if specifically set (e.g. for strict canonical URL)
    if (process.env.NEXT_PUBLIC_APP_URL && process.env.NODE_ENV === 'production') {
        // Option: Uncomment next line to force canonical. Currently preferring Dynamic.
        // redirectBase = process.env.NEXT_PUBLIC_APP_URL 
    }

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user) {
            // Check Profile for Onboarding Status
            const { data: profile } = await supabase
                .from('professional_profiles')
                .select('onboarding_step')
                .eq('user_id', user.id)
                .single()

            const step = profile?.onboarding_step || 0

            // If onboarding is complete (3), go to intended destination or dashboard
            if (step >= 3) {
                return NextResponse.redirect(`${redirectBase}${next}`)
            } else {
                return NextResponse.redirect(`${redirectBase}/onboarding`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${redirectBase}/login?error=auth-code-error`)
}

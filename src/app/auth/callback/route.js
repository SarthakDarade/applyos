import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

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
                .from('profiles')
                .select('onboarding_step')
                .eq('id', user.id)
                .single()

            const step = profile?.onboarding_step || 0

            // If onboarding is complete (3), go to intended destination or dashboard
            // If not complete, force them to the correct step
            if (step >= 3) {
                return NextResponse.redirect(`${origin}${next}`)
            } else {
                // Simplified flow: All new users go to the single onboarding page
                return NextResponse.redirect(`${origin}/onboarding`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}

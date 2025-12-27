import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    // Determine safe Base URL to prevent localhost redirects in prod
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!baseUrl) {
        if (request.url.includes('localhost') || request.url.includes('127.0.0.1')) {
            baseUrl = new URL(request.url).origin
        } else {
            baseUrl = 'https://applyos.pro'
        }
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
                .from('profiles')
                .select('onboarding_step')
                .eq('id', user.id)
                .single()

            const step = profile?.onboarding_step || 0

            // If onboarding is complete (3), go to intended destination or dashboard
            if (step >= 3) {
                return NextResponse.redirect(`${baseUrl}${next}`)
            } else {
                return NextResponse.redirect(`${baseUrl}/onboarding`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${baseUrl}/login?error=auth-code-error`)
}

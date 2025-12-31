import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Failsafe: If Supabase redirects to Root with Code (Misconfiguration), forward to Callback
    if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('code')) {
        const callbackUrl = new URL('/auth/callback', request.url)
        callbackUrl.search = request.nextUrl.search
        return NextResponse.redirect(callbackUrl)
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Check onboarding step
        const { data: profile } = await supabase
            .from('professional_profiles')
            .select('onboarding_step')
            .eq('user_id', user.id)
            .single()

        if (profile?.onboarding_step < 3) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Mail, Loader2, KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Form() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [loading, setLoading] = useState(false)
    const [resetLoading, setResetLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [socialLoading, setSocialLoading] = useState(null) // 'google' or 'linkedin'
    const [showReset, setShowReset] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)

    const supabase = createClient()
    const router = useRouter()



    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        if (isSignUp) {
            await handleSignUp()
        } else {
            await handleLogin()
        }
        // Loading disabled in sub-functions if error, or redirect if success
    }

    async function handleLogin() {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setMessage(`Error: ${error.message}`)
            if (error.message.includes("Invalid login credentials") || error.message.includes("password")) {
                setShowReset(true)
            }
            setLoading(false)
        } else {
            router.refresh()
            router.push('/dashboard')
        }
    }

    async function handleSignUp() {
        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: getRedirectUrl(),
            },
        })

        if (error) {
            setMessage(`Error: ${error.message}`)
            setLoading(false)
        } else {
            if (data?.user && !data?.session) {
                setMessage('Account created! Please check your email to confirm.')
                setLoading(false)
            } else {
                router.refresh()
                router.push('/dashboard')
            }
        }
    }

    async function handleResetPassword() {
        setResetLoading(true)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-callback`,
        })
        if (error) {
            setMessage(`Reset Error: ${error.message}`)
        } else {
            setMessage('Password reset link sent! Check your email.')
            setShowReset(false)
        }
        setResetLoading(false)
    }

    const getRedirectUrl = () => {
        if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
            return 'https://applyos.pro/auth/callback'
        }
        return `${window.location.origin}/auth/callback`
    }

    async function handleSocialLogin(provider) {
        setSocialLoading(provider)
        setMessage('')
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: getRedirectUrl(),
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            },
        })
        if (error) {
            setMessage(`Error: ${error.message}`)
            setSocialLoading(null)
        }
    }

    return (
        <div className="mt-8 space-y-6">
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="secondary"
                    className="w-full flex justify-center items-center gap-2 h-11 text-sm bg-white/5 hover:bg-white/10 border border-white/10"
                    onClick={() => handleSocialLogin('google')}
                    disabled={socialLoading || loading}
                >
                    {socialLoading === 'google' ? (
                        'Connecting...'
                    ) : (
                        <>
                            <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                            Google
                        </>
                    )}
                </Button>

                <Button
                    variant="secondary"
                    className="w-full flex justify-center items-center gap-2 h-11 text-sm bg-white/5 hover:bg-white/10 border border-white/10"
                    onClick={() => handleSocialLogin('linkedin_oidc')}
                    disabled={socialLoading || loading}
                >
                    {socialLoading === 'linkedin_oidc' ? (
                        'Connecting...'
                    ) : (
                        <>
                            <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="linkedin" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path></svg>
                            LinkedIn
                        </>
                    )}
                </Button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0e0e11] px-2 text-neutral-500">Or continue with email</span>
                </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-medium text-neutral-400 uppercase tracking-wide">
                        Email address
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="glass-input block w-full rounded-lg bg-white/5 p-3 pl-10 text-white sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                            placeholder="name@company.com"
                        />
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-xs font-medium text-neutral-400 uppercase tracking-wide">
                            Password
                        </label>
                        {!isSignUp && showReset && (
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                disabled={resetLoading}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                {resetLoading ? 'Sending link...' : 'Forgot password?'}
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input block w-full rounded-lg bg-white/5 p-3 pl-10 text-white sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                            placeholder="••••••••"
                        />
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                    </div>
                </div>

                {message && (
                    <div className={`text-sm p-3 rounded-md bg-white/5 border border-white/5 ${message.startsWith('Error') || message.startsWith('Reset Error') ? 'text-red-400' : 'text-green-400'}`}>
                        {message}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading || socialLoading}
                    className="w-full flex justify-center h-11 text-base bg-white text-black hover:bg-neutral-200 mt-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isSignUp ? 'Creating account...' : 'Signing in...'}
                        </>
                    ) : (
                        isSignUp ? 'Create Account' : 'Sign In'
                    )}
                </Button>
            </form>

            <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={() => {
                        setIsSignUp(!isSignUp)
                        setMessage('')
                        setShowReset(false)
                    }}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                    {isSignUp ? (
                        <>Already have an account? <span className="text-blue-400">Sign in</span></>
                    ) : (
                        <>Don't have an account? <span className="text-blue-400">Sign up</span></>
                    )}
                </button>
            </div>
        </div>
    )
}

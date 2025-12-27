'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { User } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Navbar() {
    const [user, setUser] = useState(null)
    const supabase = createClient()

    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
            <div className={`mx-auto max-w-5xl h-14 rounded-full flex items-center justify-between px-6 transition-all duration-500 border ${scrolled ? 'bg-black/60 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/40' : 'bg-white/5 backdrop-blur-md border-white/5 shadow-lg'}`}>
                <Link href="/" className="flex items-center space-x-2.5 group">
                    <div className="bg-white text-black h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        A
                    </div>
                    <span className="font-bold text-sm tracking-wide text-white/90 group-hover:text-white transition-colors">
                        ApplyOS
                    </span>
                </Link>
                <div className="flex items-center space-x-6">
                    <Link href="/pricing" className="text-xs font-medium text-neutral-400 transition-colors hover:text-white hover:tracking-wide">
                        Pricing
                    </Link>

                    {user ? (
                        <>
                            <Link href="/dashboard" className="text-xs font-medium text-neutral-400 transition-colors hover:text-white hover:tracking-wide">
                                Dashboard
                            </Link>
                            <Link href="/settings">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-105 shadow-inner">
                                    <User className="h-3.5 w-3.5 text-white/80" />
                                </div>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-xs font-medium text-neutral-400 transition-colors hover:text-white hover:tracking-wide">
                                Login
                            </Link>
                            <Link href="/login">
                                <Button className="h-8 px-5 text-xs rounded-full bg-white text-black hover:bg-neutral-200 border-none shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105 font-semibold tracking-wide">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

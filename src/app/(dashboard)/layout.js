import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'

export default async function DashboardLayout({ children }) {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background selection:bg-white/20">
            <nav className="fixed top-4 left-0 right-0 z-50 px-6">
                <div className="glass mx-auto max-w-5xl h-14 rounded-full flex items-center justify-between px-6 transition-all duration-300">
                    <Link href="/dashboard" className="flex items-center space-x-2 group">
                        <div className="bg-white text-black h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs group-hover:rotate-12 transition-transform">
                            A
                        </div>
                        <span className="font-bold text-sm tracking-tight text-white/90 group-hover:text-white transition-colors">
                            ApplyOS
                        </span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/email-generator" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                            Email Gen
                        </Link>
                        <Link href="/job-match" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                            Job Match
                        </Link>

                        <Link href="/applications" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors px-2 border-l border-r border-white/10">
                            Applications
                        </Link>
                        <Link href="/resume" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                            Resume
                        </Link>
                        <Link href="/profile" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                            Profile
                        </Link>
                        <Link href="/settings" className="flex items-center space-x-1 group">
                            <Settings className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                        </Link>
                        <Link href="/settings">
                            {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                                        alt="User"
                                        className="h-6 w-6 rounded-full ml-2 border border-white/20 object-cover"
                                    />
                                </>
                            ) : (
                                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white uppercase ml-2 border border-white/10">
                                    {(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email)?.[0]}
                                </div>
                            )}
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-5xl px-6 pt-32 pb-12">
                {children}
            </main>
        </div>
    )
}

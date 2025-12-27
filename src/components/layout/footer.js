import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black py-20 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>

            <div className="mx-auto max-w-6xl px-6 relative z-10">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="bg-white text-black h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm group-hover:rotate-12 transition-transform">
                                A
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-200 transition-colors">
                                ApplyOS
                            </span>
                        </Link>
                        <p className="text-neutral-400 text-sm leading-relaxed font-light">
                            The professional operating system for your career. Built for clarity, not hype.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <div className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-neutral-400 hover:text-white">
                                <Twitter className="w-4 h-4" />
                            </div>
                            <div className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-neutral-400 hover:text-white">
                                <Github className="w-4 h-4" />
                            </div>
                            <div className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-neutral-400 hover:text-white">
                                <Linkedin className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold tracking-wide text-sm">Product</h3>
                        <ul className="space-y-3 text-sm text-neutral-400">
                            <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Resume Builder</Link></li>
                            <li><Link href="/job-match" className="hover:text-blue-400 transition-colors">Job Match Analysis</Link></li>
                            <li><Link href="/email-generator" className="hover:text-blue-400 transition-colors">Email Generator</Link></li>
                            <li><Link href="/companies" className="hover:text-blue-400 transition-colors">Company Insights</Link></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold tracking-wide text-sm">Resources</h3>
                        <ul className="space-y-3 text-sm text-neutral-400">
                            <li><Link href="/templates" className="hover:text-blue-400 transition-colors">Resume Templates</Link></li>
                            <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold tracking-wide text-sm">Company</h3>
                        <ul className="space-y-3 text-sm text-neutral-400">
                            <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
                            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/refund-policy" className="hover:text-blue-400 transition-colors">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-neutral-500">
                        &copy; {new Date().getFullYear()} ApplyOS Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        All Systems Operational
                    </div>
                </div>
            </div>
        </footer>
    )
}

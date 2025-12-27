'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Search, BarChart2, Briefcase, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardGreeting({ user }) {
    const router = useRouter();
    const [greeting, setGreeting] = useState('Good day');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    const name = user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name || 'there';

    if (!mounted) return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/5">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {name}</h1>
                <p className="text-neutral-400 mt-1">Ready to accelerate your career today?</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 pb-8 border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-white tracking-tight flex items-center gap-3"
                    >
                        {greeting}, {name} <span className="text-3xl">👋</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-neutral-400 mt-2 text-lg"
                    >
                        What would you like to focus on today?
                    </motion.p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
            >
                <button
                    onClick={() => router.push('/resume')}
                    className="group flex flex-col items-start p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 text-left"
                >
                    <div className="p-2 bg-blue-500/10 rounded-lg mb-3 group-hover:bg-blue-500/20 transition-colors">
                        <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-white font-semibold text-sm mb-1">Update Resume</span>
                    <span className="text-xs text-neutral-500 group-hover:text-neutral-400">Polish your CV for applications</span>
                </button>

                <button
                    onClick={() => router.push('/job-match')}
                    className="group flex flex-col items-start p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 text-left"
                >
                    <div className="p-2 bg-purple-500/10 rounded-lg mb-3 group-hover:bg-purple-500/20 transition-colors">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-white font-semibold text-sm mb-1">Analyze Job Match</span>
                    <span className="text-xs text-neutral-500 group-hover:text-neutral-400">Tailor your resume to a job desc</span>
                </button>

                <button
                    onClick={() => router.push('/email-generator')}
                    className="group flex flex-col items-start p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 text-left"
                >
                    <div className="p-2 bg-pink-500/10 rounded-lg mb-3 group-hover:bg-pink-500/20 transition-colors">
                        <Mail className="w-5 h-5 text-pink-400" />
                    </div>
                    <span className="text-white font-semibold text-sm mb-1">Email Generator</span>
                    <span className="text-xs text-neutral-500 group-hover:text-neutral-400">Draft outreach emails instantly</span>
                </button>

                <button
                    onClick={() => document.getElementById('analytics-chart')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group flex flex-col items-start p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 text-left"
                >
                    <div className="p-2 bg-amber-500/10 rounded-lg mb-3 group-hover:bg-amber-500/20 transition-colors">
                        <BarChart2 className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-white font-semibold text-sm mb-1">View Analytics</span>
                    <span className="text-xs text-neutral-500 group-hover:text-neutral-400">Check your application progress</span>
                </button>
            </motion.div>
        </div>
    );
}

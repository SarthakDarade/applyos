'use client';

import { TrendingUp, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function HealthScoreCard({ score, trend }) {
    // trend: number (positive or negative delta)

    let status = 'Needs Work';
    let color = 'text-red-400';
    let gradient = 'from-red-500/20 via-red-500/5 to-transparent';
    let ringColor = '#ef4444';

    if (score >= 80) {
        status = 'Excellent';
        color = 'text-emerald-400';
        gradient = 'from-emerald-500/20 via-emerald-500/5 to-transparent';
        ringColor = '#34d399';
    } else if (score >= 50) {
        status = 'Fair';
        color = 'text-yellow-400';
        gradient = 'from-yellow-500/20 via-yellow-500/5 to-transparent';
        ringColor = '#facc15';
    }

    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    // We animate this via framer motion

    return (
        <div className={`glass-panel p-6 rounded-xl flex items-center justify-between relative overflow-hidden bg-gradient-to-br ${gradient}`}>

            {/* Background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px]" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <Activity className={`w-4 h-4 ${color}`} />
                    <h3 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Profile Health</h3>
                </div>

                <div className="flex flex-col items-start mt-2">
                    <span className={`text-2xl font-bold text-white mb-1`}>{status}</span>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/20 border border-white/5 ${color} text-[10px] font-semibold uppercase tracking-wider`}>
                        {score >= 80 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {score >= 80 ? 'Optimized' : 'Action Needed'}
                    </div>
                </div>

                {trend !== 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center text-xs font-medium mt-4 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                        <TrendingUp className={`w-3.5 h-3.5 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                        <span>{trend > 0 ? '+' : ''}{trend}% vs last week</span>
                    </motion.div>
                )}
            </div>

            <div className="relative h-24 w-24 flex-shrink-0">
                <svg className="h-full w-full -rotate-90 transform drop-shadow-xl" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle
                        className="text-white/5"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                    />
                    {/* Indicator */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="transition-all duration-1000 ease-out"
                        stroke={ringColor}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                    />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-center">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-2xl font-bold text-white tracking-tighter"
                    >
                        {score}
                    </motion.span>
                </div>
            </div>
        </div>
    )
}

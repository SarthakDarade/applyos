'use client';

import { CheckCircle2, AlertTriangle, XCircle, BookOpen, ShieldAlert, ListChecks, Briefcase, TrendingUp, Target, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function JobMatchResult({ analysis, onAddSkill }) {
    if (!analysis) return null;

    const {
        fit_score = 0,
        fit_level = 'Unknown',
        summary,
        skills_match = { matched: [], missing: [] },
        experience_match = { relevant: [], gaps: [] },
        risk_flags = [],
        recommended_actions = []
    } = analysis;

    // Radius for the circle
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (fit_score / 100) * circumference;

    // Color logic
    let colorClass = 'text-yellow-400';
    let strokeClass = 'stroke-yellow-400';
    let bgClass = 'bg-yellow-400/10 border-yellow-400/20';

    if (fit_score >= 80) {
        colorClass = 'text-green-400';
        strokeClass = 'stroke-green-400';
        bgClass = 'bg-green-400/10 border-green-400/20';
    } else if (fit_score < 50) {
        colorClass = 'text-red-400';
        strokeClass = 'stroke-red-400';
        bgClass = 'bg-red-400/10 border-red-400/20';
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 1. HERO SCORE CARD (Span 12 md:Span 8) */}
                <div className={cn("md:col-span-8 p-8 rounded-3xl border backdrop-blur-md relative overflow-hidden group", bgClass)}>
                    {/* Background Glow */}
                    <div className={cn("absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-opacity group-hover:opacity-30", colorClass.replace('text-', 'bg-'))} />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        {/* Gauge */}
                        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r={radius}
                                    className="stroke-white/10 fill-none"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r={radius}
                                    className={cn("fill-none transition-all duration-[2s] ease-out", strokeClass)}
                                    strokeWidth="8"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={cn("text-4xl font-bold tracking-tighter", colorClass)}>{fit_score}%</span>
                                <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Match</span>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="text-center md:text-left space-y-3">
                            <h2 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
                                {fit_level} Match
                                {fit_score >= 80 && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                            </h2>
                            <p className="text-neutral-300 text-lg leading-relaxed max-w-xl">
                                {summary}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. KEY STATS (Span 12 md:Span 4) */}
                <div className="md:col-span-4 grid grid-rows-2 gap-6">
                    {/* Stat 1: Matched Keywords */}
                    <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center items-center relative overflow-hidden hover:bg-white/5 transition-colors">
                        <TrendingUp className="w-8 h-8 text-blue-400 mb-2 opacity-80" />
                        <span className="text-3xl font-bold text-white">{skills_match.matched.length}</span>
                        <span className="text-xs uppercase tracking-wider text-neutral-400">Skills Matched</span>
                    </div>
                    {/* Stat 2: Missing Keywords */}
                    <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center items-center relative overflow-hidden hover:bg-white/5 transition-colors">
                        <Target className="w-8 h-8 text-orange-400 mb-2 opacity-80" />
                        <span className="text-3xl font-bold text-white">{skills_match.missing.length}</span>
                        <span className="text-xs uppercase tracking-wider text-neutral-400">Skills Gaps</span>
                    </div>
                </div>

                {/* 3. SKILLS ANALYSIS (Span 12 md:Span 6) */}
                <div className="md:col-span-6 glass-panel p-8 rounded-3xl space-y-6 md:min-h-[300px]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                            Skills Breakdown
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {skills_match.matched.length > 0 && (
                            <div>
                                <span className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 block">Strong Matches</span>
                                <div className="flex flex-wrap gap-2">
                                    {skills_match.matched.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {skills_match.missing.length > 0 && (
                            <div>
                                <span className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 block">Areas to Improve</span>
                                <div className="flex flex-wrap gap-2">
                                    {skills_match.missing.map((skill, i) => (
                                        <button
                                            key={i}
                                            onClick={() => onAddSkill && onAddSkill(skill)}
                                            className="group relative px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/20 hover:text-red-200 transition-all flex items-center gap-2 cursor-pointer"
                                            title="Add to Profile"
                                        >
                                            {skill}
                                            {onAddSkill && (
                                                <span className="w-0 overflow-hidden group-hover:w-4 transition-all duration-300 inline-flex items-center justify-center">
                                                    <Plus className="w-3 h-3 text-red-300" />
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {skills_match.matched.length === 0 && skills_match.missing.length === 0 && (
                            <div className="flex items-center justify-center h-40 text-neutral-500 italic">No specific skill analysis available</div>
                        )}
                    </div>
                </div>

                {/* 4. EXPERIENCE & RISKS (Span 12 md:Span 6) */}
                <div className="md:col-span-6 space-y-6">
                    {/* Experience */}
                    <div className="glass-panel p-8 rounded-3xl space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-purple-400" />
                            Experience Check
                        </h3>
                        {experience_match.relevant.length > 0 ? (
                            <ul className="space-y-3">
                                {experience_match.relevant.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-neutral-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                                        <span className="leading-relaxed">{typeof item === 'string' ? item : item.description || JSON.stringify(item)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-neutral-500 italic text-sm">No specific relevant experience highlighted.</p>
                        )}
                        {experience_match.gaps.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Gaps Identified</p>
                                <ul className="space-y-2">
                                    {experience_match.gaps.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-neutral-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Risks - Condensed */}
                    {risk_flags.length > 0 && (
                        <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl">
                            <h4 className="text-red-400 font-bold flex items-center gap-2 mb-3">
                                <ShieldAlert className="w-4 h-4" />
                                Risk Alerts
                            </h4>
                            <ul className="space-y-2">
                                {risk_flags.map((flag, i) => (
                                    <li key={i} className="text-sm text-red-200/80 pl-6 relative">
                                        <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-red-500/50 rounded-full" />
                                        {flag}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* 5. ACTION PLAN (Span 12) */}
                <div className="md:col-span-12 glass-panel p-8 rounded-3xl border-t-4 border-t-blue-500/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                        <ListChecks className="w-6 h-6 text-blue-400" />
                        Recommended Action Plan
                    </h3>

                    {recommended_actions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommended_actions.map((action, i) => (
                                <div key={i} className="bg-white/5 hover:bg-white/10 p-5 rounded-xl border border-white/5 transition-colors group">
                                    <div className="flex gap-4">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-sm shrink-0 border border-blue-500/30 group-hover:scale-110 transition-transform">
                                            {i + 1}
                                        </span>
                                        <p className="text-sm text-neutral-300 group-hover:text-white transition-colors leading-relaxed">
                                            {action}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-neutral-500">
                            <p>Review the job description closely for more specific insights.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

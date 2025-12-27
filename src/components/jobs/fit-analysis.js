'use client'

import { CheckCircle2, XCircle, AlertCircle, Briefcase, MapPin, Award } from 'lucide-react'

export function JobFitAnalysis({ fit }) {
    if (!fit || !fit.score) return null

    // Determine color based on score directly
    let colorClass = 'text-red-400'
    let progressColor = 'bg-red-500'
    if (fit.score >= 80) {
        colorClass = 'text-emerald-400'
        progressColor = 'bg-emerald-500'
    } else if (fit.score >= 60) {
        colorClass = 'text-blue-400'
        progressColor = 'bg-blue-500'
    } else if (fit.score >= 40) {
        colorClass = 'text-yellow-400'
        progressColor = 'bg-yellow-500'
    }

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Professional Fit Analysis</h3>

            {/* Main Score Card */}
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
                {/* Background Progress Bar */}
                <div className="absolute top-0 left-0 h-1 w-full bg-white/5">
                    <div className={`h-full ${progressColor} transition-all duration-1000`} style={{ width: `${fit.score}%` }}></div>
                </div>

                <div className="flex items-center justify-between z-10 relative">
                    <div>
                        <p className={`text-3xl font-bold ${colorClass}`}>{fit.score}%</p>
                        <p className="text-sm text-neutral-400 font-medium">{fit.readiness}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-neutral-500 mb-1">Key Strengths</div>
                        <div className="flex flex-col items-end gap-1">
                            {fit.strengths.length > 0 ? (
                                fit.strengths.map(s => (
                                    <span key={s} className="text-xs text-emerald-400/80 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {s}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-neutral-600">No major strengths detected</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Skills Analysis */}
                <div className="glass-panel p-5 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-blue-400" />
                        <h4 className="text-sm font-medium text-white">Skills Alignment</h4>
                    </div>

                    {fit.skills.matched.length > 0 && (
                        <div>
                            <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Matched</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {fit.skills.matched.map(s => (
                                    <span key={s} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-xs border border-blue-500/20">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {fit.skills.missing.length > 0 && (
                        <div className="mt-3">
                            <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Missing</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {fit.skills.missing.map(s => (
                                    <span key={s} className="px-2 py-0.5 rounded bg-white/5 text-neutral-500 text-xs border border-white/5">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Context Analysis */}
                <div className="space-y-4">
                    {/* Experience */}
                    <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5">
                                <Briefcase className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase font-bold">Experience</p>
                                <p className="text-sm text-white">{fit.experience.status}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-neutral-500">You: {fit.experience.user}y</p>
                            <p className="text-xs text-neutral-600">Job: {fit.experience.required}y+</p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5">
                                <MapPin className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase font-bold">Location</p>
                                <p className="text-sm text-white">{fit.location.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
                    <div>
                        <h5 className="text-sm font-medium text-white mb-1">Gap Analysis</h5>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            {fit.gaps.length > 0 ? (
                                <span>
                                    Primary gaps identified in <span className="text-white">{fit.gaps.join(', ')}</span>.
                                    Consider updating your profile or addressing these in your cover letter.
                                </span>
                            ) : (
                                "Your profile is highly aligned with this role. You are well-positioned to apply."
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

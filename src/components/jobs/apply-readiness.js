'use client'

import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

export function ApplyReadiness({ readiness }) {
    if (!readiness) return null

    let bgClass = 'bg-neutral-900 border-neutral-800'
    let icon = <AlertCircle className="w-4 h-4 text-neutral-500" />
    let textClass = 'text-neutral-300'

    if (readiness.status === 'READY') {
        bgClass = 'bg-emerald-500/5 border-emerald-500/10'
        icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        textClass = 'text-emerald-100' // slightly softer than 400
    } else if (readiness.status === 'PARTIALLY_READY') {
        bgClass = 'bg-yellow-500/5 border-yellow-500/10'
        icon = <Info className="w-4 h-4 text-yellow-500" />
        textClass = 'text-yellow-100'
    }

    return (
        <div className={`rounded-lg border p-3 flex items-start gap-3 mt-4 ${bgClass}`}>
            <div className="mt-0.5 shrink-0">
                {icon}
            </div>
            <div>
                <p className={`text-sm font-medium ${textClass} mb-0.5`}>
                    {readiness.label}
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                    {readiness.explanation}
                </p>

                {readiness.hints.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {readiness.hints.map(hint => (
                            <p key={hint} className="text-[10px] text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                                {hint}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

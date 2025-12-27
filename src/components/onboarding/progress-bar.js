'use client'

import { usePathname } from 'next/navigation'
import { Check, Circle } from 'lucide-react'

export function OnboardingProgress() {
    const pathname = usePathname()

    // Determine current step
    let currentStep = 1
    if (pathname.includes('step-2')) currentStep = 2
    if (pathname.includes('step-3')) currentStep = 3

    const steps = [
        { id: 1, label: 'Upload Resume' },
        { id: 2, label: 'Profile' },
        { id: 3, label: 'Preferences' }
    ]

    return (
        <div className="flex items-center justify-center gap-4 mb-10">
            {steps.map((step, index) => {
                const isActive = step.id === currentStep
                const isCompleted = step.id < currentStep

                return (
                    <div key={step.id} className="flex items-center">
                        {/* Line connector */}
                        {index > 0 && (
                            <div className={`h-[2px] w-12 mr-4 ${isCompleted ? 'bg-blue-600' : 'bg-white/10'}`} />
                        )}

                        {/* Step Circle */}
                        <div className="flex flex-col items-center gap-2">
                            <div className={`
                                h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-300
                                ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : ''}
                                ${isCompleted ? 'bg-black border-blue-600 text-blue-500' : ''}
                                ${!isActive && !isCompleted ? 'bg-black/20 border-white/10 text-neutral-600' : ''}
                             `}>
                                {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{step.id}</span>}
                            </div>
                            <span className={`text-[10px] uppercase tracking-wider font-medium ${isActive ? 'text-white' : 'text-neutral-600'}`}>
                                {step.label}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

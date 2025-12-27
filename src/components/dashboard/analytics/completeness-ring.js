'use client'

export function CompletenessRing({ score }) {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (score / 100) * circumference

    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative h-24 w-24">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                        className="text-neutral-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                    />
                    <circle
                        className="text-white transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                    />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-center">
                    <span className="text-xl font-bold text-white">{score}%</span>
                </div>
            </div>
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide">Profile Score</p>
        </div>
    )
}

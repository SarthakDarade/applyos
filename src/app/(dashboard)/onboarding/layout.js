import { Zap } from 'lucide-react'

export default function OnboardingLayout({ children }) {
    return (
        <div className="min-h-screen bg-black/95 text-white flex flex-col">
            {/* Top Bar */}
            <div className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white fill-current" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">ApplyOS</span>
                    </div>
                    <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                        Setup Wizard
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}

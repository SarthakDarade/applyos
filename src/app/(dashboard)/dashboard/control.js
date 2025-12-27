'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Activity } from 'lucide-react'

export function JobControl() {
    const [isRunning, setIsRunning] = useState(false)

    return (
        <div className="flex flex-col sm:items-end gap-2">
            <div className="flex items-center gap-3">
                {isRunning && (
                    <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 animate-in fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Auto-apply Active
                    </span>
                )}
                <Button
                    variant={isRunning ? "destructive" : "primary"}
                    onClick={() => setIsRunning(!isRunning)}
                    className={`gap-2 min-w-[140px] transition-all ${isRunning ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20' : 'shadow-[0_0_15px_rgba(255,255,255,0.1)]'}`}
                >
                    {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isRunning ? "Pause System" : "Start Auto-Apply"}
                </Button>
            </div>

            <p className="text-[10px] text-neutral-500 font-medium">
                {isRunning
                    ? "ApplyOS is applying responsibly."
                    : "System paused. No applications will be sent."}
            </p>
        </div>
    )
}

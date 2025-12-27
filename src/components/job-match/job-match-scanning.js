'use client';

import { Loader2, Search, FileText, CheckCircle2 } from 'lucide-react';

export function JobMatchScanning() {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                {/* Ripples */}
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-75 duration-[3s]" />
                <div className="absolute inset-2 bg-purple-500/20 rounded-full animate-ping opacity-75 delay-300 duration-[3s]" />
                <div className="absolute inset-4 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 flex items-center justify-center z-10">
                    <Search className="w-12 h-12 text-white/80 animate-pulse" />
                </div>

                {/* Rotating Border */}
                <div className="absolute inset-0 border-t-2 border-r-2 border-blue-500/50 rounded-full animate-spin duration-[3s]" />
            </div>

            <div className="space-y-4 text-center max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                    Analyzing Job Fit...
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-neutral-400 animate-in slide-in-from-bottom-2 duration-500 delay-100">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                        <span>Scanning job requirements...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-400 animate-in slide-in-from-bottom-2 duration-500 delay-500 fill-mode-backwards">
                        <FileText className="w-3 h-3 text-purple-400" />
                        <span>Scanning resume...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-400 animate-in slide-in-from-bottom-2 duration-500 delay-[1.5s] fill-mode-backwards">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        <span>Calculating match score...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

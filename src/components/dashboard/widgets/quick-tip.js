'use client';

import { Lightbulb, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TIPS = [
    {
        title: 'Optimize your Headlines',
        text: 'Recruiters spend 6 seconds on a resume. Make your headline punchy and relevant to the job.',
        tag: 'Resume'
    },
    {
        title: 'Follow up smartly',
        text: 'Send a follow-up email 3-5 days after applying. It increases visibility by 40%.',
        tag: 'Strategy'
    },
    {
        title: 'Quantify Achievements',
        text: 'Don\'t just say "Lead Sales". Say "Increased sales by 20% over 6 months".',
        tag: 'Content'
    },
    {
        title: 'Tailor your Resume',
        text: 'Use the Job Match tool to ensure your resume has at least 70% overlap with the job description.',
        tag: 'Tool'
    }
];

export function QuickTip() {
    const [index, setIndex] = useState(0);

    const nextTip = () => {
        setIndex((prev) => (prev + 1) % TIPS.length);
    };

    // Auto-rotate tips every 10s
    useEffect(() => {
        const timer = setInterval(nextTip, 10000);
        return () => clearInterval(timer);
    }, []);

    const tip = TIPS[index];

    return (
        <div className="glass-panel p-6 rounded-xl flex flex-col h-full relative overflow-hidden group bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20">
            {/* Animated Background Blob */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-[60px] animate-pulse pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-sm font-medium text-amber-200 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Quick Tip
                </h3>
                <button
                    onClick={nextTip}
                    className="p-2 text-amber-400/70 hover:text-white hover:bg-amber-500/20 rounded-full transition-all active:rotate-180 duration-500"
                    title="Next Tip"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="flex-1 relative z-10 min-h-[120px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                                {tip.tag}
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-3 leading-snug">
                            {tip.title}
                        </h4>
                        <p className="text-sm text-neutral-300 leading-relaxed font-light">
                            {tip.text}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Indicators */}
            <div className="flex gap-1.5 mt-4 justify-center">
                {TIPS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-amber-400' : 'w-1 bg-white/10'}`}
                    />
                ))}
            </div>

            {/* Decorative Icon */}
            <div className="absolute -bottom-6 -right-6 text-amber-500/5 transform rotate-[-15deg] pointer-events-none transition-transform group-hover:scale-110 duration-500">
                <Lightbulb className="w-32 h-32" />
            </div>
        </div>
    );
}

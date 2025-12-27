'use client';

import { ArrowRight, Lightbulb, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function InsightsList({ suggestions }) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="glass-panel p-6 rounded-xl space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white uppercase tracking-wide">Suggested Improvements</h3>
                    <p className="text-xs text-neutral-400">Boost your hiring potential</p>
                </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {suggestions.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link
                            href="/profile"
                            className="group flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden"
                        >
                            {/* Hover Shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                            <div className="mt-1">
                                {item.impact === 'High' ? (
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)] animate-pulse" />
                                ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                )}
                            </div>

                            <div className="flex-1">
                                <span className="text-sm text-neutral-200 group-hover:text-white transition-colors block mb-1 leading-snug">
                                    {item.text}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${item.impact === 'High'
                                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        }`}>
                                        {item.impact} Impact
                                    </span>
                                    {item.impact === 'High' && (
                                        <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-medium">
                                            <TrendingUp className="w-2.5 h-2.5" />
                                            +15% Visibility
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="self-center p-1.5 rounded-full text-neutral-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

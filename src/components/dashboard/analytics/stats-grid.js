'use client';

import { Briefcase, Send, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function StatsGrid({ stats }) {
    const router = useRouter();

    const items = [
        {
            label: 'Jobs Matched',
            value: stats.matched,
            icon: Briefcase,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'group-hover:border-blue-500/50',
            gradient: 'from-blue-500/20 to-transparent',
            link: '/job-match',
            delay: 0
        },
        {
            label: 'Applications',
            value: stats.applied,
            icon: Send,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'group-hover:border-purple-500/50',
            gradient: 'from-purple-500/20 to-transparent',
            link: '/applications',
            delay: 0.1
        },
        {
            label: 'Responses',
            value: stats.responses,
            icon: MessageSquare,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'group-hover:border-emerald-500/50',
            gradient: 'from-emerald-500/20 to-transparent',
            link: '/applications',
            delay: 0.2
        },
        {
            label: 'Interviews',
            value: stats.interviews,
            icon: Calendar,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'group-hover:border-orange-500/50',
            gradient: 'from-orange-500/20 to-transparent',
            link: '/applications',
            delay: 0.3
        },
    ];

    // Animated Sparkline Path
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 1.5, ease: "easeInOut" }
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: item.delay }}
                        onClick={() => router.push(item.link)}
                        className={cn(
                            "glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group transition-all duration-300 hover:shadow-2xl cursor-pointer",
                            item.border
                        )}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Dynamic Background Gradient */}
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                            item.gradient
                        )} />

                        {/* Top corner blob */}
                        <div className={cn(
                            "absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-all duration-500",
                            item.bg.replace('/10', '')
                        )} />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <Icon className={cn("w-6 h-6 mb-4", item.color)} />
                                <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300", item.bg, item.color)}>
                                    View
                                </div>
                            </div>

                            <div>
                                <span className="text-3xl font-bold text-white tracking-tight block mb-1">{item.value}</span>
                                <span className="text-sm text-neutral-400 font-medium">{item.label}</span>
                            </div>
                        </div>

                        {/* Decorative Sparkline */}
                        <div className="absolute bottom-4 right-4 w-1/2 h-8 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                            <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                                <motion.path
                                    d={`M0,${20 + idx * 2} Q25,${5 + idx} 50,${15 - idx} T100,${10 + idx}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    className={item.color}
                                    variants={pathVariants}
                                    initial="hidden"
                                    animate="visible"
                                />
                            </svg>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

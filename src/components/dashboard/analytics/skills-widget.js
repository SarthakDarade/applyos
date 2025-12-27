'use client';

import { Edit2, Zap, BrainCircuit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function SkillsWidget({ skills }) {
    const router = useRouter();
    // skills: array of strings
    const hasSkills = skills && skills.length > 0;
    // Show a few more skills if available since we have space now
    const topSkills = hasSkills ? skills.slice(0, 15) : [];

    return (
        <div className="glass-panel p-6 rounded-xl h-full flex flex-col bg-gradient-to-br from-blue-500/5 to-transparent">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-medium text-blue-200 uppercase tracking-wide flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-blue-400" />
                        Skills DNA
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">Found in your profile</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md">{skills?.length || 0} Skills</span>
                    <button
                        onClick={() => router.push('/profile')}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                        title="Edit Skills"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {hasSkills ? (
                <div className="flex flex-wrap gap-2 content-start relative">
                    {/* Fading mask at bottom if needed, though we limit to 15 */}
                    {topSkills.map((skill, index) => (
                        <motion.span
                            key={`${skill}-${index}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => router.push('/profile')}
                            className="px-3 py-1.5 rounded-lg bg-neutral-900/50 border border-white/5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/30 transition-all cursor-pointer whitespace-nowrap active:scale-95 select-none shadow-sm hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                            title="Manage skills in Profile"
                        >
                            {skill}
                        </motion.span>
                    ))}
                    {skills.length > 15 && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            onClick={() => router.push('/profile')}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-neutral-500 hover:text-white italic whitespace-nowrap cursor-pointer transition-colors"
                        >
                            +{skills.length - 15} more...
                        </motion.span>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-neutral-500 space-y-3 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neutral-600">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div className="text-center px-4">
                        <p className="text-xs font-medium text-neutral-400 mb-1">No skills detected yet</p>
                        <button
                            onClick={() => router.push('/profile')}
                            className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline"
                        >
                            Complete your profile to unlock insights
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

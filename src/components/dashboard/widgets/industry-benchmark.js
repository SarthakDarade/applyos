'use client';

import { BarChart3, Info, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getProfessionalProfile } from '@/app/actions/professional-profile';

export function IndustryBenchmark() {
    const [hovered, setHovered] = useState(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([
        { label: 'Skills', user: 0, avg: 65 },
        { label: 'Exp.', user: 0, avg: 50 },
        { label: 'Edu.', user: 0, avg: 75 },
        { label: 'Certs', user: 0, avg: 30 },
    ]);

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const profile = await getProfessionalProfile(user.id);

                    if (profile) {
                        // Calculate Scores based on Profile Data

                        // 1. Skills: ~8% per skill, max 100 (approx 12-13 skills)
                        const skillCount = Array.isArray(profile.skills) ? profile.skills.length : 0;
                        const skillsScore = Math.min(100, Math.max(10, skillCount * 8));

                        // 2. Experience: ~15% per year, max 100 (approx 7 years)
                        const expYears = Number(profile.years_experience) || 0;
                        const expScore = Math.min(100, Math.max(10, expYears * 15));

                        // 3. Education: Base 40, +30 per entry, max 100
                        const eduCount = Array.isArray(profile.education) ? profile.education.length : 0;
                        const eduScore = Math.min(100, 40 + (eduCount * 30));

                        // 4. Certifications: ~30% per cert
                        const certCount = Array.isArray(profile.certifications) ? profile.certifications.length : 0;
                        const certScore = Math.min(100, Math.max(5, certCount * 30));

                        setData([
                            { label: 'Skills', user: Math.round(skillsScore), avg: 65 },
                            { label: 'Exp.', user: Math.round(expScore), avg: 50 },
                            { label: 'Edu.', user: Math.round(eduScore), avg: 75 },
                            { label: 'Certs', user: Math.round(certScore), avg: 30 },
                        ]);
                    }
                }
            } catch (error) {
                console.error("Benchmark Load Error:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return (
        <div className="glass-panel p-6 rounded-xl flex flex-col h-full bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-sm font-medium text-purple-200 uppercase tracking-wide flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        Industry Benchmark
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">Your profile vs. Top Candidates</p>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-[10px] font-medium bg-black/20 p-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                        <span className="text-blue-200">You</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span>
                        <span className="text-neutral-400">Avg.</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between h-40 gap-6 mt-auto w-full px-2 pb-2 relative z-10">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="w-full h-px bg-white/10 border-t border-dashed border-white/20" />
                    <div className="w-full h-px bg-white/10 border-t border-dashed border-white/20" />
                    <div className="w-full h-px bg-white/10 border-t border-dashed border-white/20" />
                    <div className="w-full h-px bg-white/10 border-t border-dashed border-white/20" />
                </div>

                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    </div>
                ) : (
                    data.map((item, i) => (
                        <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-3 group relative"
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {/* Tooltip */}
                            {hovered === i && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-neutral-900/90 border border-white/10 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md z-20 whitespace-nowrap"
                                >
                                    <div className="text-[10px] text-neutral-400 font-medium text-center mb-0.5">{item.label}</div>
                                    <div className="flex gap-3 text-xs">
                                        <span className="text-blue-400 font-bold">{item.user}%</span>
                                        <span className="text-neutral-500">vs</span>
                                        <span className="text-neutral-500 font-medium">{item.avg}%</span>
                                    </div>
                                </motion.div>
                            )}

                            <div className="w-full flex items-end justify-center flex-1 relative gap-2 px-1">
                                {/* Avg Bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${item.avg}%` }}
                                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                    className="w-full max-w-[12px] bg-white/5 border border-white/5 rounded-t-sm relative group-hover:bg-white/10 transition-colors"
                                />

                                {/* User Bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${item.user}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 + 0.2, ease: "easeOut" }}
                                    className={`w-full max-w-[12px] rounded-t-sm shadow-[0_0_15px_rgba(56,189,248,0.3)] relative group-hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all ${item.user >= item.avg ? 'bg-gradient-to-t from-blue-600 to-cyan-400' : 'bg-gradient-to-t from-orange-600 to-yellow-400'
                                        }`}
                                >
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/50" />
                                </motion.div>
                            </div>

                            <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 ${hovered === i ? 'text-blue-300' : 'text-neutral-500'}`}>
                                {item.label}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

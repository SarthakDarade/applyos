'use client';

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Target, Shield, Zap, Users, Globe, ExternalLink, Heart, Award, Coffee, ArrowRight } from 'lucide-react'

const FADE_UP = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const STAGGER = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } }
}

export default function AboutPage() {
    const { scrollYProgress } = useScroll();
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-purple-500/30">
            <Navbar />

            {/* Scroll Progress Bar */}
            <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-[60]" />

            <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
                {/* Backgrounds */}
                <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
                <div className="fixed inset-0 pointer-events-none -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] mix-blend-overlay"></div>

                {/* 1. Hero / Mission */}
                <section className="px-6 relative z-10 mb-32">
                    <div className="max-w-5xl mx-auto text-center space-y-8">
                        <motion.div initial="hidden" animate="visible" variants={FADE_UP}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 mb-6">
                                <Award className="w-3 h-3" /> Our Mission
                            </div>
                        </motion.div>
                        <motion.h1
                            initial="hidden" animate="visible" variants={FADE_UP}
                            className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-[1.1]"
                        >
                            We're fixing the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">broken hiring process.</span>
                        </motion.h1>
                        <motion.p
                            initial="hidden" animate="visible" variants={FADE_UP}
                            className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-light"
                        >
                            Talent is equally distributed, but opportunity is not. We build tools to help qualified candidates get noticed by the algorithms and humans that matter.
                        </motion.p>
                    </div>
                </section>

                {/* 2. Values Grid */}
                <section className="px-6 mb-32 relative">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10"></div>
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={STAGGER}
                            className="grid md:grid-cols-3 gap-8"
                        >
                            {[
                                { title: "Clarity over Hype", desc: "No buzzwords. No false promises. Just clear, actionable data to help you improve.", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10" },
                                { title: "User-First Design", desc: "We believe professional tools should feel magical, not like a compliance form.", icon: Heart, color: "text-red-400", bg: "bg-red-500/10" },
                                { title: "Democratizing Access", desc: "Advanced ATS insights shouldn't be reserved for those who can afford expensive career coaches.", icon: Globe, color: "text-emerald-400", bg: "bg-emerald-500/10" }
                            ].map((item, i) => (
                                <motion.div key={i} variants={FADE_UP} className="p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors shadow-2xl relative overflow-hidden group">
                                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-6`}>
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                                    <p className="text-neutral-400 leading-relaxed">{item.desc}</p>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-500"></div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* 3. Stats / Impact */}
                <section className="px-6 mb-32">
                    <div className="max-w-5xl mx-auto bg-neutral-900/50 border border-white/5 rounded-3xl p-12 md:p-20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
                        <div className="grid md:grid-cols-3 gap-12 text-center relative z-10">
                            <div className="space-y-4">
                                <div className="text-5xl md:text-6xl font-bold text-white">10k+</div>
                                <div className="text-neutral-400 font-medium uppercase tracking-wide text-sm">Resumes Optimized</div>
                            </div>
                            <div className="space-y-4">
                                <div className="text-5xl md:text-6xl font-bold text-white">85%</div>
                                <div className="text-neutral-400 font-medium uppercase tracking-wide text-sm">Success Rate Increase</div>
                            </div>
                            <div className="space-y-4">
                                <div className="text-5xl md:text-6xl font-bold text-white">0</div>
                                <div className="text-neutral-400 font-medium uppercase tracking-wide text-sm">Selling User Data</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Team (Minimalist) */}
                <section className="px-6 pb-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-12">Built by builders.</h2>
                        <div className="flex flex-wrap justify-center gap-8">
                            {/* Placeholder for team members - kept generic/abstract for "World Class" feel if no specific data */}
                            <div className="group">
                                <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 overflow-hidden relative mb-4 mx-auto group-hover:scale-110 transition-transform">
                                    {/* Abstract Avatar */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-80"></div>
                                </div>
                                <h4 className="text-white font-medium">Design & Product</h4>
                            </div>
                            <div className="group">
                                <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 overflow-hidden relative mb-4 mx-auto group-hover:scale-110 transition-transform">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-80"></div>
                                </div>
                                <h4 className="text-white font-medium">Engineering</h4>
                            </div>
                            <div className="group">
                                <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 overflow-hidden relative mb-4 mx-auto group-hover:scale-110 transition-transform">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-80"></div>
                                </div>
                                <h4 className="text-white font-medium">Data Science</h4>
                            </div>
                        </div>
                        <div className="mt-12">
                            <p className="text-neutral-500">
                                We are a small, dedicated team distributed across the globe. <br />
                                Want to join us?
                            </p>
                            <Link href="/contact" className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                See open roles <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    )
}

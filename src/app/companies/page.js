'use client';

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Building2, Globe, Users, TrendingUp, MapPin, ExternalLink, ArrowRight } from 'lucide-react'
import { useState } from 'react'

const FADE_UP = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const STAGGER = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
}

const MOCK_COMPANIES = [
    { name: "TechNova", industry: "SaaS", location: "San Francisco, CA", size: "500-1000", score: 92, tags: ["Remote", "High Growth"] },
    { name: "GreenEnergy", industry: "CleanTech", location: "Austin, TX", size: "100-500", score: 88, tags: ["Sustainable", "Hybrid"] },
    { name: "FinStream", industry: "FinTech", location: "New York, NY", size: "1000+", score: 85, tags: ["Enterprise", "Bonus"] },
    { name: "HealthPlus", industry: "HealthTech", location: "Boston, MA", size: "50-100", score: 79, tags: ["Startup", "Equity"] },
    { name: "EduGrow", industry: "EdTech", location: "Remote", size: "200-500", score: 94, tags: ["Remote First", "Flexible"] },
    { name: "CloudScale", industry: "Infrastructure", location: "Seattle, WA", size: "1000+", score: 81, tags: ["Cloud", "Hardware"] },
]

export default function CompaniesPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredCompanies = MOCK_COMPANIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            <main className="flex-1 pt-32 pb-24 px-6 relative">
                {/* Backgrounds */}
                <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
                <div className="fixed inset-0 pointer-events-none -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay"></div>

                {/* Header */}
                <section className="max-w-6xl mx-auto mb-20 text-center">
                    <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                            Company <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Insights</span>
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                            Discover companies that align with your values. Get insider data on culture, hiring trends, and interview processes.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative mt-12 group">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full px-6 py-4 backdrop-blur-md shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                                <Search className="w-6 h-6 text-neutral-400 mr-4" />
                                <input
                                    type="text"
                                    placeholder="Search companies by name or industry..."
                                    className="bg-transparent border-none outline-none text-white w-full placeholder:text-neutral-500 text-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Companies Grid */}
                <section className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={STAGGER}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredCompanies.map((company, index) => (
                            <motion.div
                                key={index}
                                variants={FADE_UP}
                                className="group relative bg-neutral-900/50 border border-white/5 rounded-2xl p-6 hover:bg-neutral-900 transition-colors hover:border-white/10 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="w-5 h-5 text-neutral-400 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>

                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xl font-bold">
                                        {company.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{company.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                                            <Building2 className="w-3 h-3" /> {company.industry}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                        <MapPin className="w-4 h-4 text-neutral-500" /> {company.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                        <Users className="w-4 h-4 text-neutral-500" /> {company.size} employees
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        <span className="text-emerald-400 font-medium">Hiring Score: {company.score}/100</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {company.tags.map((tag, i) => (
                                        <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-neutral-300 border border-white/5 group-hover:border-white/10 transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {filteredCompanies.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-neutral-500 text-lg">No companies found matching "{searchQuery}"</p>
                        </div>
                    )}
                </section>

                {/* CTA */}
                <section className="max-w-4xl mx-auto mt-32 text-center p-12 rounded-3xl bg-gradient-to-br from-blue-900/20 to-black border border-white/5">
                    <h2 className="text-3xl font-bold text-white mb-4">Don't see a company?</h2>
                    <p className="text-neutral-400 mb-8">Request comprehensive analysis for any company you're targeting.</p>
                    <Button className="bg-white text-black hover:bg-neutral-200 px-8 py-6 rounded-full text-lg font-semibold">
                        Request Analysis
                    </Button>
                </section>

            </main>
            <Footer />
        </div>
    )
}

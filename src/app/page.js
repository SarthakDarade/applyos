'use client';

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Shield, Target, FileText, Mail, BarChart3, Database, Zap, Lock, Grid, ChevronRight, Star, Send } from 'lucide-react'

// Animation Variants
const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const STAGGER_CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30 bg-black text-white overflow-hidden font-sans">
      <Navbar />

      <main className="flex-1 relative">

        {/* --- Dynamic Background --- */}
        <div className="fixed inset-0 pointer-events-none -z-10 bg-black" />
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>

        {/* 1. HERO SECTION */}
        <section className="min-h-[90vh] flex items-center justify-center pt-32 pb-24 px-6 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={STAGGER_CONTAINER}
            className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-8"
          >
            <motion.div variants={FADE_UP_VARIANTS}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-300 backdrop-blur-md shadow-lg shadow-white/5 hover:border-white/20 transition-colors cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Now with AI Job Match Analysis
              </div>
            </motion.div>

            <motion.h1 variants={FADE_UP_VARIANTS} className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-[1.05] drop-shadow-2xl">
              Build a resume that <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-neutral-200 via-neutral-400 to-neutral-600">actually fits the job.</span>
            </motion.h1>

            <motion.p variants={FADE_UP_VARIANTS} className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
              ApplyOS is the professional operating system for your career. <br className="hidden md:block" />
              Analyze fit, fix gaps, and apply with precision—no generic spam.
            </motion.p>

            <motion.div variants={FADE_UP_VARIANTS} className="pt-8 flex flex-col sm:flex-row gap-5 items-center w-full sm:w-auto">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="h-14 px-8 w-full sm:w-auto text-lg bg-white text-black hover:bg-neutral-100 hover:scale-[1.02] active:scale-95 transition-all rounded-full font-bold shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                  Build Your Resume
                </Button>
              </Link>
              <Link href="/job-match" className="w-full sm:w-auto">
                <Button variant="outline" className="h-14 px-8 w-full sm:w-auto text-lg bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95 transition-all rounded-full backdrop-blur-md">
                  Analyze Job Fit
                </Button>
              </Link>
            </motion.div>

            <motion.p variants={FADE_UP_VARIANTS} className="text-xs text-neutral-500 font-medium tracking-wide uppercase pt-4 opacity-70">
              No credit card required • Privacy First • ATS Safe
            </motion.p>
          </motion.div>
        </section>


        {/* 2. PROBLEM RECOGNITION */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="py-32 px-6 border-t border-white/5 bg-neutral-950/50 backdrop-blur-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
          <div className="max-w-6xl mx-auto">
            <motion.div variants={FADE_UP_VARIANTS} className="text-center mb-20">
              <h2 className="text-3xl font-semibold text-white mb-4">Why is applying so painful?</h2>
              <p className="text-neutral-400">The current process is broken. We fixed it.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Generic Resumes Fail", desc: "Sending the same standardized PDF to unique job descriptions is a guarantee for rejection.", icon: FileText, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
                { title: "Guesswork is Expensive", desc: "You waste hours applying to roles where you are a 10% fit, missing the ones where you are a 90% fit.", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                { title: "Black Box Feedback", desc: "Most portals are black holes. You click submit and never know why you were rejected.", icon: Lock, color: "text-neutral-400", bg: "bg-white/5", border: "border-white/10" }
              ].map((item, i) => (
                <motion.div key={i} variants={FADE_UP_VARIANTS} className={`p-8 rounded-3xl border ${item.border} ${item.bg} hover:bg-opacity-20 transition-colors backdrop-blur-sm group`}>
                  <item.icon className={`w-8 h-8 ${item.color} mb-6`} />
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-neutral-400 leading-relaxed font-light text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>


        {/* 3. CORE FEATURES (Abstract UI Mockups) */}
        <section className="py-32 px-6 bg-black relative z-10 overflow-hidden">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="max-w-7xl mx-auto grid gap-32 relative z-10">

            {/* Feature 1: Resume Builder */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={FADE_UP_VARIANTS}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-8 order-2 lg:order-1">
                <div className="p-3 bg-blue-500/10 w-fit rounded-xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">Standardized <br /><span className="text-neutral-500">Resume Builder</span></h3>
                  <p className="text-lg text-neutral-400 leading-relaxed max-w-md">
                    Stop fighting with Word templates. Our builder forces a clean, ATS-readable structure that recruiters love.
                  </p>
                </div>
                <ul className="space-y-3 text-sm text-neutral-300">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Auto-formatted for readability</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Skill tagging & verification</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Export to perfect PDF</li>
                </ul>
              </div>

              {/* Abstract UI Mockup: Builder */}
              <div className="relative order-1 lg:order-2 group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <motion.div
                  whileHover={{ rotateY: -2, rotateX: 2 }}
                  className="relative bg-neutral-900 border border-white/10 rounded-2xl p-4 md:p-6 aspect-[4/3] flex flex-col shadow-2xl overflow-hidden"
                >
                  {/* Mock Header */}
                  <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div className="h-2 w-20 rounded-full bg-white/10"></div>
                  </div>
                  {/* Mock Content */}
                  <div className="flex-1 flex gap-4">
                    <div className="w-1/3 bg-white/5 rounded-lg p-3 space-y-3 hidden sm:block">
                      <div className="h-2 w-12 rounded bg-white/10"></div>
                      <div className="h-2 w-20 rounded bg-white/10"></div>
                      <div className="h-2 w-16 rounded bg-white/10"></div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-4 md:p-6 shadow-inner relative overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-500">
                      {/* Paper Look */}
                      <div className="mx-auto max-w-[80%] space-y-4">
                        <div className="h-6 w-1/2 bg-neutral-900/10 rounded"></div>
                        <div className="h-3 w-full bg-neutral-900/10 rounded"></div>
                        <div className="space-y-2 pt-4">
                          <div className="h-3 w-3/4 bg-neutral-900/10 rounded"></div>
                          <div className="h-3 w-5/6 bg-neutral-900/10 rounded"></div>
                          <div className="h-3 w-2/3 bg-neutral-900/10 rounded"></div>
                        </div>
                      </div>
                      {/* Floating Badge */}
                      <div className="absolute bottom-4 right-4 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded shadow-lg font-bold flex items-center gap-1 animate-pulse">
                        <Check className="w-3 h-3" /> ATS Ready
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Feature 2: Job Match */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={FADE_UP_VARIANTS}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Abstract UI Mockup: Analysis */}
              <div className="relative group lg:order-1 order-1 perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <motion.div
                  whileHover={{ rotateY: 2, rotateX: 2 }}
                  className="relative bg-neutral-900 border border-white/10 rounded-2xl p-6 aspect-[4/3] flex items-center justify-center shadow-2xl overflow-hidden"
                >
                  <div className="relative w-48 h-48 md:w-64 md:h-64">
                    <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                      <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                      <motion.circle
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 0.85 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        cx="50" cy="50" r="45"
                        stroke="#a855f7"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="1"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <span className="text-5xl font-bold">85%</span>
                      <span className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">Match Score</span>
                    </div>
                  </div>
                  {/* Floating Tooltips */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="absolute top-10 right-4 bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md shadow-lg"
                  >
                    Missing: TypeScript
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, type: "spring" }}
                    className="absolute bottom-10 left-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md shadow-lg"
                  >
                    Strong: React.js
                  </motion.div>
                </motion.div>
              </div>

              <div className="space-y-8 lg:order-2 order-2">
                <div className="p-3 bg-purple-500/10 w-fit rounded-xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">Intelligent <br /><span className="text-neutral-500">Fit Analysis</span></h3>
                  <p className="text-lg text-neutral-400 leading-relaxed max-w-md">
                    Don't apply blindly. Paste the job description and get an instant compatibility score with actionable advice.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-neutral-300 font-mono">Keyword Check</div>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-neutral-300 font-mono">Structure Analysis</div>
                </div>
              </div>
            </motion.div>


            {/* Feature 3: Email Generator */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={FADE_UP_VARIANTS}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-8 order-2 lg:order-1">
                <div className="p-3 bg-emerald-500/10 w-fit rounded-xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">Instant <br /><span className="text-neutral-500">HR Outreach</span></h3>
                  <p className="text-lg text-neutral-400 leading-relaxed max-w-md">
                    Write professional cover emails in seconds. Tailored to the hiring manager, the role, and your skills.
                  </p>
                </div>
                <Link href="/email-generator" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-medium group">
                  Try Generator <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Abstract UI Mockup: Email */}
              <div className="relative order-1 lg:order-2 group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <motion.div
                  whileHover={{ rotateY: -2, rotateX: 2 }}
                  className="relative bg-neutral-900 border border-white/10 rounded-2xl p-6 aspect-[4/3] flex flex-col shadow-2xl overflow-hidden"
                >
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><Send className="w-4 h-4" /></div>
                    <div className="flex-1">
                      <div className="h-2 w-24 bg-white/10 rounded mb-1"></div>
                      <div className="h-2 w-32 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-white/5 flex-1 font-mono text-xs text-neutral-400 leading-relaxed overflow-hidden relative">
                    <p>Dear Hiring Manager,</p>
                    <p>I am writing to express my strong interest in the Senior Developer role at...</p>
                    <div className="h-2 w-full bg-emerald-500/20 rounded animate-pulse"></div>
                    <div className="h-2 w-3/4 bg-emerald-500/20 rounded animate-pulse"></div>

                    <div className="absolute bottom-4 right-4">
                      <div className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold shadow-lg shadow-blue-600/20">Send</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </section>


        {/* 4. PRICING TEASER (Clean, Simple) */}
        <section className="py-32 px-6 border-t border-white/5 bg-neutral-950/30">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-white"
            >
              Start for free. Upgrade for power.
            </motion.h2>
            <p className="text-neutral-400 text-xl max-w-2xl mx-auto font-light">
              Every core feature is available on the free tier. <br /> Pro unlocks unlimited AI analysis and priority features.
            </p>

            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="px-8 py-3 rounded-xl bg-neutral-800 text-white text-sm font-medium shadow-sm border border-white/10">
                Free
              </div>
              <div className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/20 border border-transparent">
                Pro ($12/mo)
              </div>
            </div>

            <div className="pt-8">
              <Link href="/pricing" className="text-neutral-400 hover:text-white border-b border-neutral-600 hover:border-white pb-0.5 transition-colors text-sm">
                View Full Pricing Comparison
              </Link>
            </div>
          </div>
        </section>


        {/* 5. FINAL CTA */}
        <section className="py-40 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black -z-10" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={FADE_UP_VARIANTS}
            className="max-w-3xl mx-auto text-center space-y-10"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
              Ready to apply <br /> with confidence?
            </h2>
            <p className="text-xl text-neutral-400">Join serious professionals applying with clarity.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/dashboard">
                <Button className="h-16 px-12 text-xl bg-white text-black hover:bg-neutral-200 hover:scale-[1.05] active:scale-95 transition-all rounded-full font-bold shadow-[0_0_60px_rgba(255,255,255,0.2)]">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  )
}

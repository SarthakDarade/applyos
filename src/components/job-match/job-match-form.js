'use client';

import { useState } from 'react';
import { Search, Loader2, Sparkles, Briefcase, MapPin, Building2, AlignLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { JobMatchScanning } from './job-match-scanning';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

export function JobMatchForm({ onAnalysisComplete, resumeData }) {
    const [isLoading, setIsLoading] = useState(false);

    // Upgrade Modal State
    const [showUpgrade, setShowUpgrade] = useState(false);

    const [formData, setFormData] = useState({
        company: '',
        title: '',
        type: 'Full-time',
        category: 'Software',
        location: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description) return;



        setIsLoading(true);
        try {
            // Infer Level
            let roleLevel = 'Mid';
            const lowerTitle = formData.title.toLowerCase();
            if (lowerTitle.includes('senior') || lowerTitle.includes('lead') || lowerTitle.includes('staff') || lowerTitle.includes('principal')) {
                roleLevel = 'Senior';
            } else if (lowerTitle.includes('junior') || lowerTitle.includes('intern') || lowerTitle.includes('associate') || lowerTitle.includes('entry')) {
                roleLevel = 'Entry';
            }

            const payload = {

                job: {
                    role: formData.title,
                    company: formData.company,
                    industry: formData.category,
                    description: formData.description,
                    level: roleLevel,
                    type: formData.type
                }
            };

            const response = await fetch('/api/job-match/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Analysis failed');
            }

            const analysisData = await response.json();

            // ----------------------------------------------------
            // CLIENT-SIDE SCORING LOGIC
            // ----------------------------------------------------

            const calculateJobFit = (analysis) => {
                let score = 0;

                const matched = analysis.matched_skills?.length || 0;
                const missing = analysis.missing_skills?.length || 0;
                const totalSkills = matched + missing;

                // Skills coverage (40%)
                if (totalSkills > 0) {
                    score += (matched / totalSkills) * 40;
                }

                // Experience relevance (30%)
                if (analysis.relevant_experience?.length > 0) {
                    score += 30;
                }

                // Risk penalties (-10 each, max -30)
                score -= Math.min((analysis.risk_flags?.length || 0) * 10, 30);

                score = Math.max(0, Math.min(100, Math.round(score)));

                let level = "Weak";
                if (score >= 70) level = "Strong";
                else if (score >= 45) level = "Moderate";

                return { score, level };
            };

            const generateJobMatchSummary = (level) => {
                if (level === "Strong") {
                    return "Strong alignment with most core job requirements.";
                }
                if (level === "Moderate") {
                    return "Partial alignment with some missing skills or experience gaps.";
                }
                return "Limited alignment with key job requirements. This role may be a stretch without preparation.";
            };

            // Artificial delay to show off the scanning animation if response is too fast
            await new Promise(r => setTimeout(r, 2000));

            let { score, level } = calculateJobFit(analysisData);

            // Override with Webhook Score if provided
            if (analysisData.fit_score !== undefined || analysisData.score !== undefined) {
                let rawScore = analysisData.fit_score ?? analysisData.score;

                // Normalize to 100 if decimal (e.g., 0.85 -> 85)
                if (rawScore <= 1 && rawScore > 0) rawScore *= 100;

                score = Math.round(rawScore);

                // Recalculate level based on backend score for consistency
                if (score >= 70) level = "Strong";
                else if (score >= 45) level = "Moderate";
                else level = "Weak";
            }

            const summary = generateJobMatchSummary(level);

            const finalResult = {
                fit_score: score,
                fit_level: level,
                summary: summary,
                skills_match: {
                    matched: analysisData.matched_skills || [],
                    missing: analysisData.missing_skills || []
                },
                experience_match: {
                    relevant: analysisData.relevant_experience || [],
                    gaps: analysisData.experience_gaps || []
                },
                risk_flags: analysisData.risk_flags || [],
                recommended_actions: analysisData.recommended_action_plan || analysisData.recommended_actions || []
            };

            onAnalysisComplete(finalResult);

        } catch (error) {
            console.error(error);
            if (error.message && error.message.includes("Limit")) {
                setShowUpgrade(true);
            } else {
                toast.error(error.message || "Analysis failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <JobMatchScanning />;
    }

    return (
        <>
            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                title="Unlock full job fit analysis"
                message="See exactly where you match and what's missing. Get actionable insights to improve your chances."
                feature="Full breakdown of matched skills, experience gaps, and risk flags"
            />

            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                    {/* Left Column: Job Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-white/80 font-semibold pb-2 border-b border-white/5">
                            <Info className="w-4 h-4 text-purple-400" />
                            Job Details
                        </div>

                        <div className="space-y-5">
                            {/* Title */}
                            <div className="group relative">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block group-focus-within:text-blue-400 transition-colors">
                                    Job Title <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Frontend Engineer"
                                        className="w-full bg-neutral-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-neutral-600"
                                    />
                                </div>
                            </div>

                            {/* Company */}
                            <div className="group relative">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block group-focus-within:text-blue-400 transition-colors">
                                    Company Name
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        placeholder="e.g. Acme Corp"
                                        className="w-full bg-neutral-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-neutral-600"
                                    />
                                </div>
                            </div>

                            {/* Row: Type & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-3 py-3 text-sm text-neutral-200 focus:border-blue-500/50 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Remote">Remote</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-3 py-3 text-sm text-neutral-200 focus:border-blue-500/50 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="Software">Software Eng</option>
                                        <option value="Data">Data Science</option>
                                        <option value="Product">Product Mgmt</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Description */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-white/80 font-semibold pb-2 border-b border-white/5">
                            <AlignLeft className="w-4 h-4 text-purple-400" />
                            Job Description
                        </div>

                        <div className="group relative h-full">
                            <div className="absolute inset-0 bg-blue-500/5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                            <textarea
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Paste the full job description here. The more detailed, the better the analysis..."
                                className="w-full h-[280px] bg-neutral-900/50 border border-white/10 rounded-xl px-5 py-4 text-sm text-neutral-200 leading-relaxed focus:border-blue-500/50 outline-none transition-all resize-none placeholder:text-neutral-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="relative overflow-hidden group bg-white hover:bg-neutral-200 text-black px-10 py-6 rounded-xl font-bold text-base shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all transform hover:scale-[1.02]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            Run Analysis
                        </span>
                    </Button>
                </div>
            </form>
        </>
    );
}

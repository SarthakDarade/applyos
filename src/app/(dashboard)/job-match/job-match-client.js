'use client';

import { useState, useEffect } from 'react';
import { JobMatchForm } from '@/components/job-match/job-match-form';
import { JobMatchResult } from '@/components/job-match/job-match-result';
import { addSkillToProfile } from '@/app/actions/professional-profile';
import { calculateScore, getMatchLevel, getMatchSummary } from '@/lib/job-match-utils';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast-context';

export function JobMatchClient({ resume }) {
    const [analysisResult, setAnalysisResult] = useState(null);
    const [localResume, setLocalResume] = useState(resume);
    const { addToast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        setLocalResume(resume);
    }, [resume]);

    const handleAddToResume = async (skill) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                addToast('Please sign in to update your profile.', 'error');
                return;
            }

            const result = await addSkillToProfile(user.id, skill);

            if (!result.success) {
                addToast(result.message || result.error || 'Failed to update profile.', 'error');
                return;
            }

            // Update analysis result UI (Move from missing to matched)
            if (analysisResult) {
                setAnalysisResult(prev => {
                    if (!prev) return prev;
                    const missing = prev.skills_match?.missing || [];
                    const matched = prev.skills_match?.matched || [];

                    if (missing.includes(skill)) {
                        const newMatched = [...matched, skill];
                        const newMissing = missing.filter(s => s !== skill);

                        const relevantExpCount = prev.experience_match?.relevant?.length || 0;
                        const riskCount = prev.risk_flags?.length || 0;

                        const newScore = calculateScore({
                            matchedCount: newMatched.length,
                            missingCount: newMissing.length,
                            relevantExpCount,
                            riskCount
                        });

                        const newLevel = getMatchLevel(newScore);
                        const newSummary = getMatchSummary(newLevel);

                        return {
                            ...prev,
                            fit_score: newScore,
                            fit_level: newLevel,
                            summary: newSummary,
                            skills_match: {
                                matched: newMatched,
                                missing: newMissing
                            }
                        };
                    }
                    return prev;
                });
            }

            addToast(`Added "${skill}" to your profile.`, 'success');

        } catch (error) {
            console.error('Error adding skill:', error);
            addToast('Failed to update profile.', 'error');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700">

            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white tracking-tight">
                    Job Match Analysis
                </h1>
                <p className="text-neutral-400 text-lg max-w-xl mx-auto">
                    Manually check if a job is a good fit for you. We analyze your resume against the job details to provide an honest readiness assessment.
                </p>
            </div>

            {/* Input Form */}
            <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-xl">
                <JobMatchForm
                    onAnalysisComplete={setAnalysisResult}
                    resumeData={localResume?.data}
                />
            </div>

            {/* Analysis Results */}
            {analysisResult && (
                <div id="results" className="scroll-mt-32">
                    <JobMatchResult
                        analysis={analysisResult}
                        onAddSkill={handleAddToResume}
                    />
                </div>
            )}
        </div>
    );
}

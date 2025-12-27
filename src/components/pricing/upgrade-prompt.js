'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Contextual Upgrade Prompt
 * 
 * Shows when user encounters Pro feature
 * Calm, respectful, outcome-focused
 */
export function UpgradePrompt({
    isOpen,
    onClose,
    title = "Make your application job-ready",
    message = "You're close. Pro helps you tailor your resume and apply with confidence.",
    feature,
    onUpgrade
}) {
    const router = useRouter();

    const handleUpgrade = () => {
        if (onUpgrade) {
            onUpgrade();
        } else {
            router.push('/pricing');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-neutral-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl pointer-events-auto relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                                <Sparkles className="w-6 h-6 text-blue-400" />
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold text-white mb-3">
                                {title}
                            </h3>
                            <p className="text-neutral-400 leading-relaxed mb-6">
                                {message}
                            </p>

                            {/* Feature Highlight (if provided) */}
                            {feature && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-neutral-300">{feature}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-3">
                                <Button
                                    onClick={handleUpgrade}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
                                >
                                    Upgrade to Pro – ₹299/month
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>

                                <button
                                    onClick={onClose}
                                    className="w-full h-12 text-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    Continue with Free
                                </button>
                            </div>

                            {/* Trust Signal */}
                            <p className="text-xs text-neutral-600 text-center mt-4">
                                Cancel anytime. No annual commitment.
                            </p>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * Specific upgrade prompts for different contexts
 */
export const upgradePrompts = {
    jobMatch: {
        title: "Unlock full job fit analysis",
        message: "See exactly where you match and what's missing. Get actionable insights to improve your chances.",
        feature: "Full breakdown of matched skills, experience gaps, and risk flags"
    },

    resumeTailor: {
        title: "Tailor your resume for this role",
        message: "Let AI optimize your resume specifically for this job. Highlight the right experience and skills.",
        feature: "AI-powered resume customization for each application"
    },

    emailGenerator: {
        title: "Generate professional HR emails",
        message: "Stand out with personalized, professional emails. Follow up confidently and professionally.",
        feature: "Unlimited AI-generated emails for recruiters and hiring managers"
    },

    pdfDownload: {
        title: "Download your job-ready resume",
        message: "Get a professionally formatted PDF optimized for ATS systems and recruiters.",
        feature: "Priority PDF generation with professional formatting"
    },

    aiOptimization: {
        title: "Optimize with unlimited AI",
        message: "Refine your resume as many times as needed. Get it perfect before you apply.",
        feature: "Unlimited AI suggestions and improvements"
    }
};

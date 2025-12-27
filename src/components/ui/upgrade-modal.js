'use client';

import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleSubscription } from '@/lib/payment-utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Upgrade Modal - Conversion Focused
 * 
 * Philosophy:
 * - Calm, not pushy
 * - Outcome-based, not feature-dumping
 * - Respectful of user choice
 * - No dark patterns
 */
export function UpgradeModal({
    isOpen,
    onClose,
    title = "Make your application job-ready",
    message = "You're close. Pro helps you tailor your resume and apply with confidence.",
    feature
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        await handleSubscription(router);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Icon - Subtle, not flashy */}
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-blue-400" />
                    </div>

                    {/* Title & Message - Clear value prop */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-white">
                            {title}
                        </h2>
                        <p className="text-neutral-400 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Feature Context (if provided) */}
                    {feature && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-sm text-neutral-300">{feature}</p>
                        </div>
                    )}

                    {/* Actions - Primary + Secondary */}
                    <div className="space-y-3 pt-2">
                        <Button
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
                        >
                            {loading ? 'Processing...' : 'Upgrade to Pro – ₹299/month'}
                            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>

                        <button
                            onClick={onClose}
                            className="w-full h-12 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                            Continue with Free
                        </button>
                    </div>

                    {/* Trust Signal - Calm reassurance */}
                    <p className="text-xs text-neutral-600 text-center">
                        Cancel anytime. No annual commitment.
                    </p>
                </div>
            </div>
        </div>
    );
}

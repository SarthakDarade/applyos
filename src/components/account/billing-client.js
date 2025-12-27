'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { Check, X, CreditCard, Sparkles, Zap, Shield, Infinity as InfinityIcon } from 'lucide-react';

export function BillingClient({ profile }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isPro = profile?.subscription_plan === 'pro';

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel your subscription?")) return;
        setLoading(true);
        try {
            const res = await fetch('/api/payment/cancel', { method: 'POST' });
            const data = await res.json();
            if (data.error) {
                toast.error(data.error);
            } else {
                toast.success("Subscription cancelled successfully");
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            toast.error("Error cancelling subscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Background Glow for Pro */}
            {isPro && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 rounded-2xl opacity-40 blur-2xl group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
            )}

            {/* Main Glass Panel */}
            <div className={`relative rounded-2xl p-8 overflow-hidden backdrop-blur-xl border ${isPro ? 'border-white/10 bg-black/40' : 'border-white/5 bg-black/40'}`}>

                {/* Decorative Gradients inside the card */}
                {isPro && (
                    <>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                    </>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 uppercase tracking-widest">
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Current Plan</span>
                            </div>
                            {isPro ? (
                                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold tracking-wide uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)] backdrop-blur-md">
                                    Pro Active
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-neutral-400 text-[10px] font-bold tracking-wide uppercase backdrop-blur-sm">
                                    Free Tier
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                            {isPro ? (
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-sm">Unlimited Access</span>
                            ) : (
                                <span>Starter Plan</span>
                            )}
                        </h2>
                        <p className="text-neutral-400 mt-4 text-sm max-w-lg leading-relaxed font-light">
                            {isPro
                                ? 'You have full access to all ApplyOS features. Your career acceleration is ensuring no speed bumps.'
                                : 'You are currently on the free plan with limited access to job scans and application tracking.'}
                        </p>
                    </div>

                    {/* Quick Access/Status Right Side */}
                    <div className={`text-right hidden md:block p-5 rounded-2xl border backdrop-blur-md transition-all duration-500 ${isPro ? 'bg-gradient-to-br from-white/5 to-white/0 border-white/10 shadow-xl' : 'bg-white/5 border-white/5'}`}>
                        <div className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1 font-semibold">Billing Cycle</div>
                        <div className="text-white font-medium text-xl">Monthly</div>
                        <div className={`text-xs mt-2 font-medium ${isPro ? 'text-emerald-400' : 'text-neutral-500'}`}>
                            {isPro ? '● Auto-renewal active' : '○ No active subscription'}
                        </div>
                    </div>
                </div>

                {/* Features / Usage Visualization - Glassmorphic Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 relative z-10">

                    {/* Card 1 - Job Scans */}
                    <div className={`rounded-2xl p-6 border transition-all duration-500 group/card relative overflow-hidden backdrop-blur-sm ${isPro ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10' : 'bg-white/5 border-white/5'}`}>
                        {isPro && <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 mix-blend-overlay" />}
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-neutral-300 text-xs uppercase font-bold tracking-widest">Job Scans</span>
                            <Zap className={`w-4 h-4 ${isPro ? 'text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]' : 'text-neutral-600'}`} />
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-2 relative z-10">
                            {isPro ? <InfinityIcon className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-md" /> : '5/5'}
                        </div>
                        <p className="text-xs text-blue-200/60 font-medium relative z-10">{isPro ? 'Unlimited AI analysis' : 'Monthly scans limit'}</p>
                    </div>

                    {/* Card 2 - Tracking */}
                    <div className={`rounded-2xl p-6 border transition-all duration-500 group/card relative overflow-hidden backdrop-blur-sm ${isPro ? 'bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10' : 'bg-white/5 border-white/5'}`}>
                        {isPro && <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 mix-blend-overlay" />}
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-neutral-300 text-xs uppercase font-bold tracking-widest">Tracking</span>
                            <Shield className={`w-4 h-4 ${isPro ? 'text-purple-300 drop-shadow-[0_0_8px_rgba(216,180,254,0.5)]' : 'text-neutral-600'}`} />
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-2 relative z-10">
                            {isPro ? <InfinityIcon className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-md" /> : 'Limited'}
                        </div>
                        <p className="text-xs text-purple-200/60 font-medium relative z-10">{isPro ? 'Unlimited applications' : 'Manual tracking only'}</p>
                    </div>

                    {/* Card 3 - Features */}
                    <div className={`rounded-2xl p-6 border transition-all duration-500 group/card relative overflow-hidden backdrop-blur-sm ${isPro ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10' : 'bg-white/5 border-white/5'}`}>
                        {isPro && <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 mix-blend-overlay" />}
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-neutral-300 text-xs uppercase font-bold tracking-widest">Features</span>
                            <Sparkles className={`w-4 h-4 ${isPro ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]' : 'text-neutral-600'}`} />
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white mb-2 relative z-10 truncate">
                            {isPro ? 'Unlocked' : 'Basic'}
                        </div>
                        <p className="text-xs text-emerald-200/60 font-medium relative z-10">{isPro ? 'Email Gen & Resume AI' : 'Standard tools'}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                    {isPro ? (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </div>
                                <span className="text-sm text-neutral-300 font-medium tracking-wide">Your subscription is active.</span>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={loading}
                                className="w-full md:w-auto text-neutral-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 text-xs uppercase tracking-wider font-semibold"
                            >
                                {loading ? 'Processing...' : 'Cancel Subscription'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="text-sm text-neutral-300 font-medium">
                                Unlock your full potential today with ApplyOS Pro.
                            </div>
                            <Button
                                onClick={() => router.push('/pricing')}
                                className="w-full md:w-auto bg-white text-black hover:bg-neutral-100 hover:scale-[1.02] font-bold shadow-xl shadow-white/5 px-8 h-12 text-base transition-all duration-300 active:scale-95"
                            >
                                Upgrade to Pro
                            </Button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

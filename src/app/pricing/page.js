'use client';

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Check, ArrowRight, Sparkles, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast-context'

export default function PricingPage() {
    const router = useRouter()
    const { addToast } = useToast()
    const [isPro, setIsPro] = useState(false)
    const [user, setUser] = useState(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [region, setRegion] = useState('IN') // 'IN' or 'INT'
    const [processing, setProcessing] = useState(false)

    // Dynamic Import for payment utils to ensure client-side execution if needed
    const { handleSubscription } = require('@/lib/payment-utils')

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                const { data: profile } = await supabase
                    .from('professional_profiles')
                    .select('subscription_plan')
                    .eq('user_id', user.id)
                    .single()

                if (profile?.subscription_plan === 'pro') setIsPro(true)
            }
        }
        checkUser()
    }, [])

    const handlePayment = async (gateway) => {
        setProcessing(true)
        try {
            if (gateway === 'razorpay') {
                if (region === 'INT') {
                    // Start Stripe flow placeholder for now if they choose Razorpay while likely wanting International? 
                    // Actually Razorpay supports International sometimes, but we want to guide them.
                    // For now, just trigger standard Razorpay flow.
                }
                await handleSubscription(router)
            } else {
                // Stripe
                await new Promise(r => setTimeout(r, 800))
                addToast("Stripe integration coming soon! Please use Razorpay for now.", "info")
                setShowPaymentModal(false)
            }
        } catch (error) {
            console.error(error)
            addToast("Payment initialization failed. Please try again.", "error")
        } finally {
            setProcessing(false)
        }
    }

    const plans = [
        {
            name: "Free",
            tagline: "Get Started",
            price: "0",
            description: "Experience the value first",
            features: [
                "Build your resume",
                "Basic editing tools",
                "Limited job match previews",
                "Limited AI assistance"
            ],
            cta: user ? "Current Plan" : "Sign Up Free",
            href: "/login",
            popular: false
        },
        {
            name: "Pro",
            tagline: "Serious Job Seekers",
            price: region === 'IN' ? "299" : "9",
            currency: region === 'IN' ? "₹" : "$",
            priceNote: region === 'IN' ? "Less than a coffee per week" : "Less than a lunch per month",
            description: "Most users upgrade here",
            features: [
                "Tailor resume to specific jobs",
                "Full job fit analysis & gaps",
                "Unlimited AI optimization",
                "Professional HR emails",
                "Priority PDF generation"
            ],
            cta: isPro ? "Active Plan" : "Upgrade to Pro",
            href: "/login",
            popular: true
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-black text-white font-sans">
            <Navbar />

            <main className="flex-1 pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Subtle Background */}
                <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-b from-neutral-950 via-black to-black" />

                {/* Header - Calm & Clear */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
                            Get hired faster
                        </h1>
                        <p className="text-lg text-neutral-400 leading-relaxed">
                            Choose the plan that matches where you are in your job search.
                        </p>
                    </motion.div>
                </div>

                {/* Region Toggle - Simple & Compact */}
                <div className="flex justify-center mb-16">
                    <div className="bg-neutral-900 border border-white/10 p-1 rounded-lg flex relative items-center">
                        {/* Subtle Active Background */}
                        <motion.div
                            className="absolute bg-white/10 rounded-md h-[calc(100%-8px)]"
                            initial={false}
                            animate={{
                                x: region === 'IN' ? 0 : '100%'
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            style={{ width: 'calc(50% - 4px)', left: '4px', top: '4px', bottom: '4px' }}
                        />

                        {/* India Option */}
                        <button
                            onClick={() => setRegion('IN')}
                            className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 w-32 ${region === 'IN' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            <span>India</span>
                            <span className="text-xs opacity-60">₹</span>
                        </button>

                        {/* International Option */}
                        <button
                            onClick={() => setRegion('INT')}
                            className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 w-32 ${region === 'INT' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            <span>Global</span>
                            <span className="text-xs opacity-60">$</span>
                        </button>
                    </div>
                </div>

                {/* Plans - Side by Side, Equal Height */}
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-20">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col ${plan.popular
                                ? 'border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-black shadow-[0_0_40px_rgba(59,130,246,0.15)]'
                                : 'border-white/10 bg-neutral-900/30'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-4 py-1 rounded-full">
                                    {plan.description}
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                                <p className="text-sm text-neutral-400">{plan.tagline}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold text-white">
                                        {plan.currency || ''}{plan.price}
                                    </span>
                                    <span className="text-neutral-500">/month</span>
                                </div>
                                {plan.priceNote && (
                                    <p className="text-xs text-neutral-500 mt-2">{plan.priceNote}</p>
                                )}
                            </div>

                            {/* Features - Outcomes, not features */}
                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feat, j) => (
                                    <li key={j} className="flex items-start gap-3 text-sm">
                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-blue-400' : 'text-neutral-500'}`} />
                                        <span className="text-neutral-300">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <div className="mt-auto">
                                {plan.popular ? (
                                    isPro ? (
                                        <Button
                                            disabled
                                            className="w-full h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium"
                                        >
                                            <Check className="w-4 h-4 mr-2" /> Active Plan
                                        </Button>
                                    ) : (
                                        user ? (
                                            <Button
                                                onClick={() => setShowPaymentModal(true)}
                                                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
                                            >
                                                Upgrade to Pro
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        ) : (
                                            <Link href="/login" className="block w-full">
                                                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all">
                                                    Get Started with Pro
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        )
                                    )
                                ) : (
                                    <Link href="/login" className="block w-full">
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 border-white/20 text-white hover:bg-white/5 font-medium"
                                        >
                                            {user && !isPro ? 'Current Plan' : 'Sign Up Free'}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Signal - Calm, not pushy */}
                <div className="text-center max-w-xl mx-auto">
                    <p className="text-sm text-neutral-500">
                        No annual commitment. Cancel anytime. Upgrade when you're ready.
                    </p>
                </div>

                {/* Payment Modal - Simple & Respectful */}
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-neutral-900 border border-white/10 rounded-2xl p-8 max-w-md w-full"
                        >
                            <h3 className="text-2xl font-bold text-white mb-2">Choose Payment Method</h3>
                            <p className="text-neutral-400 mb-6">Select how you'd like to pay</p>

                            <div className="space-y-3">
                                {/* Razorpay */}
                                <button
                                    onClick={() => handlePayment('razorpay')}
                                    disabled={processing}
                                    className="w-full p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 transition-all text-left flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">Razorpay</div>
                                        <div className="text-xs text-blue-300">UPI, Cards, Net Banking</div>
                                    </div>
                                    {processing && <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                                </button>

                                {/* Stripe */}
                                <button
                                    onClick={() => handlePayment('stripe')}
                                    disabled={processing}
                                    className="w-full p-4 rounded-xl border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 transition-all text-left group"
                                >
                                    <div className="font-medium text-white group-hover:text-purple-400 transition-colors">Stripe</div>
                                    <div className="text-xs text-purple-300">International Cards</div>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowPaymentModal(false)}
                                disabled={processing}
                                className="w-full mt-4 text-sm text-neutral-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </div>
                )}

            </main>
            <Footer />
        </div>
    )
}

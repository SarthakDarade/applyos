import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
    title: 'Cancellation & Refund Policy - ApplyOS',
}

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen flex flex-col selection:bg-white/20 bg-black text-white">
            <Navbar />

            <main className="flex-1 py-32 px-6">
                <div className="mx-auto max-w-3xl space-y-8 glass-panel p-8 md:p-12 rounded-3xl border-white/5">
                    <h1 className="text-3xl font-bold text-white mb-6">Cancellation & Refund Policy</h1>

                    <div className="space-y-6 text-neutral-400 font-light leading-relaxed">
                        <p>Last updated: December 2025</p>

                        <h2 className="text-xl font-semibold text-white mt-8">1. Cancellation Policy</h2>
                        <p>
                            You may cancel your ApplyOS subscription at any time. Cancellation is effective immediately, stopping future automatic billing charges.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>How to Cancel:</strong> Navigate to your <strong>Settings</strong> page, select "Subscription," and click "Manage Plan" or "Cancel Subscription."</li>
                            <li><strong>Access:</strong> After cancellation, you will retain access to Pro features until the end of your current paid billing cycle. After that, your account will revert to the Free plan.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-8">2. Refund Policy</h2>
                        <p>
                            ApplyOS offers a digital SaaS product with immediate access to features.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>General Rule:</strong> Payments are generally non-refundable. We do not provide refunds or credits for partially used subscription periods.</li>
                            <li><strong>3-Day Money-Back Guarantee:</strong> If you are unhappy with the service, you may request a refund within 3 days of your <strong>initial</strong> purchase. This applies only to the first billing charge, not renewals.</li>
                            <li><strong>Duplicate Charges:</strong> If you were billed in error (e.g., duplicate charge), please contact support immediately for a full refund.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-8">3. Effect of Cancellation</h2>
                        <p>
                            Upon reverting to the Free plan:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Your Resume Inbox limit will decrease (you may need to archive/delete resumes to add new ones).</li>
                            <li>You will lose access to Pro-only features like unlimited Job Matches and Advanced AI Tailoring.</li>
                            <li>We do not delete your account data unless you explicitly request deletion via Settings.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-8">4. Contact Used</h2>
                        <p>
                            For billing disputes or refund requests, please email us directly at <a href="mailto:billing@applyos.pro" className="text-blue-400 hover:text-blue-300">billing@applyos.pro</a>.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

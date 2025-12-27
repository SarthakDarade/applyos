import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
    title: 'Terms of Service - ApplyOS',
}

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col selection:bg-white/20 bg-black text-white">
            <Navbar />

            <main className="flex-1 py-32 px-6">
                <div className="mx-auto max-w-3xl space-y-8 glass-panel p-8 md:p-12 rounded-3xl border-white/5">
                    <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>

                    <div className="space-y-6 text-neutral-400 font-light leading-relaxed">
                        <p>Last updated: December 2025</p>

                        <h2 className="text-xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
                        <p>
                            By creating an account or using ApplyOS, you agree to these Terms. If you are using ApplyOS on behalf of a company, you represent that you have authority to bind that entity.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-8">2. Nature of Service</h2>
                        <p>
                            ApplyOS provides AI-powered tools to assist with job applications. Our Service is a productivity aid, not a guarantee of employment.
                            We do not control hiring decisions made by third-party employers.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-8">3. AI Disclaimer</h2>
                        <p>
                            applyOS uses artificial intelligence to generate content (e.g., emails, report summaries). While we strive for accuracy, AI can occasionally generate incorrect or misleading information ("hallucinations").
                        </p>
                        <p className="mt-2">
                            <strong>You are responsible for reviewing and verifying</strong> all AI-generated content before sending or submitting it. ApplyOS is not liable for errors in applications submitted using our tools.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-8">4. User Responsibilities</h2>
                        <p>
                            You agree not to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Use the service for any illegal purpose or to transmit harmful code.</li>
                            <li>Attempt to reverse engineer our AI models or scrape our website.</li>
                            <li>Upload sensitive data (like SSNs) that is not required for a resume.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-8">5. Subscriptions & Payments</h2>
                        <p>
                            Certain features require a paid subscription ("Pro Plan"). Subscriptions are billed in advance on a recurring basis.
                            You may cancel your subscription at any time via the Settings page. Cancellations take effect at the end of the current billing period.
                            Refunds are provided at our sole discretion or as required by law.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-8">6. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account if you violate these Terms, specifically regarding misuse of our AI resources or API quotas.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-8">7. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, ApplyOS and its suppliers shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-8">8. Changes to Terms</h2>
                        <p>
                            We may modify these Terms at any time. We will notify users of significant changes via email or dashboard notification. Continued use of the Service constitutes acceptance of the new Terms.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-8">9. Contact</h2>
                        <p>
                            Questions regarding these Terms should be sent to <a href="mailto:support@applyos.pro" className="text-blue-400 hover:text-blue-300">support@applyos.pro</a>.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

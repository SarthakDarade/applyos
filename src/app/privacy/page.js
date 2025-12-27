import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
    title: 'Privacy Policy - ApplyOS',
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col selection:bg-white/20 bg-black text-white">
            <Navbar />

            <main className="flex-1 py-32 px-6">
                <div className="mx-auto max-w-3xl space-y-8 glass-panel p-8 md:p-12 rounded-3xl border-white/5">
                    <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>

                    <div className="space-y-6 text-neutral-400 font-light leading-relaxed">
                        <p>Last updated: December 2025</p>

                        <h2 className="text-xl font-semibold text-white mt-8">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us when you create an account, build a profile,
                            upload a resume, or communicate with us. This includes:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Account Data:</strong> Name, email address, and authentication credentials.</li>
                            <li><strong>Professional Data:</strong> Resumes, work history, education, skills, and certifications.</li>
                            <li><strong>Usage Data:</strong> Information about jobs you track, applications you generate, and interactions with our tools.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
                        <p>
                            We use your information to operate and improve ApplyOS, specifically for:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Service Delivery:</strong> Analysing your profile against job descriptions, filling applications, and generating email drafts.</li>
                            <li><strong>AI Processing:</strong> Your text data is processed by our AI models to provide insights and suggestions. We do not use your personal data to train public AI models.</li>
                            <li><strong>Communication:</strong> Sending you service updates, security alerts, and support messages.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-8">3. AI & Automated Processing</h2>
                        <p>
                            ApplyOS utilizes advanced artificial intelligence (AI) to analyse text and documents.
                            When you use features like the "Job Match" or "Email Generator," specific data (such as your resume text and job description)
                            is sent to our secure AI providers for processing. This data is transient and used solely to generate the response.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-8">4. Data Sharing & Security</h2>
                        <p>
                            We do not sell your personal data. We utilize trusted third-party service providers for hosting
                            and payment processing, who operate under strict confidentiality agreements.
                        </p>
                        <p className="mt-2">
                            We employ industry-standard encryption (SSL/TLS) for data in transit and encryption at rest for sensitive files like resumes.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-8">5. Your Data Rights</h2>
                        <p>
                            You retain full ownership of your data. You may:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Access your data via the dashboard.</li>
                            <li>Update or correct your profile information at any time.</li>
                            <li>Delete your account and all associated data permanently via the Settings page.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-8">6. Contact Us</h2>
                        <p>
                            If you have questions about this policy or our data practices, please contact our Data Privacy team at <a href="mailto:support@applyos.pro" className="text-blue-400 hover:text-blue-300">support@applyos.pro</a>.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

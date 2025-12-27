import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, MapPin } from 'lucide-react'
import { ContactForm } from '@/components/contact/contact-form'

export const metadata = {
    title: 'Contact Us - ApplyOS',
}

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col selection:bg-white/20 bg-black text-white">
            <Navbar />

            <main className="flex-1 py-32 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-white mb-4">Get in touch</h1>
                        <p className="text-neutral-400">We&apos;d love to hear from you. Here&apos;s how you can reach us.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="glass-panel p-8 rounded-2xl border-white/5">
                                <div className="flex items-start">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4 shrink-0">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">Email Support</h3>
                                        <p className="text-neutral-400 text-sm mb-4">For general inquiries and support questions.</p>
                                        <a href="mailto:support@applyos.pro" className="text-blue-400 hover:text-blue-300 font-medium">support@applyos.pro</a>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-8 rounded-2xl border-white/5">
                                <div className="flex items-start">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-4 shrink-0">
                                        <MessageSquare className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">Feedback</h3>
                                        <p className="text-neutral-400 text-sm mb-4">Have an idea to improve ApplyOS?</p>
                                        <a href="mailto:feedback@applyos.pro" className="text-purple-400 hover:text-purple-300 font-medium">feedback@applyos.pro</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ContactForm />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

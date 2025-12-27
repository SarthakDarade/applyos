'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('contact_submissions')
                .insert([formData]);

            if (error) throw error;

            setIsSuccess(true);
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Error submitting contact form:', error);
            alert('Something went wrong. Please try again or email us directly.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="glass p-8 rounded-3xl border border-white/10 h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Message Sent!</h3>
                <p className="text-neutral-400 max-w-xs">
                    Thanks for reaching out. We&apos;ll get back to you as soon as possible.
                </p>
                <Button
                    variant="outline"
                    className="mt-4 bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    onClick={() => setIsSuccess(false)}
                >
                    Send another message
                </Button>
            </div>
        );
    }

    return (
        <div className="glass p-8 rounded-3xl border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        type="text"
                        className="w-full glass-input rounded-lg h-10 px-3"
                        placeholder="Your name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Email</label>
                    <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        type="email"
                        className="w-full glass-input rounded-lg h-10 px-3"
                        placeholder="you@example.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Message</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full glass-input rounded-lg h-32 p-3 resize-none"
                        placeholder="How can we help?"
                    />
                </div>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black hover:bg-neutral-200"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
                <p className="text-xs text-neutral-500 text-center pt-2">
                    By sending this message, you agree to our Terms of Service.
                </p>
            </form>
        </div>
    );
}

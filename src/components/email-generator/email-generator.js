'use client';

import { useState } from 'react';
import { Send, Copy, Check, Loader2, Sparkles, RefreshCw, Mail, User, Briefcase, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { useToast } from '@/components/ui/toast-context'; // Assuming we have this now

export function EmailGenerator({ user, resume }) {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState(null);
    const [formData, setFormData] = useState({
        recipientName: '',
        company: '',
        jobTitle: '',
        description: '',
        tone: 'Professional'
    });

    // Upgrade Modal State
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');
    const { addToast } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!formData.company || !formData.jobTitle) {
            addToast("Please fill in the required fields.", "error");
            return;
        }

        setIsLoading(true);
        setGeneratedEmail(null);

        // Resume Data Extraction (Graceful Fallback)
        const resumeData = resume?.data || {};

        // Strict Payload Construction
        const payload = {
            user: {
                name: user?.user_metadata?.full_name || user?.email || "Candidate",
                email: user?.email
            },
            job: {
                company: formData.company,
                role: formData.jobTitle,
                description: formData.description,
                recipient_name: formData.recipientName, // Including this contextually even if not in strict spec, usually helpful for email gen
                tone: formData.tone
            }
        };

        try {
            const response = await fetch('/api/email/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            // Should return { subject: "...", body: "..." } directly
            // Handle nested 'email' object or flat result
            const data = result.email || result;

            if (data.subject && data.body) {
                setGeneratedEmail(data);
                addToast("Email draft generated!", "success");
            } else if (result.error) {
                if (result.error.includes("Upgrade")) {
                    setUpgradeMessage(result.error);
                    setShowUpgrade(true);
                } else {
                    addToast(result.error, "error");
                }
            } else {
                // Fallback if structure is unexpected
                addToast("Generated content is invalid.", "error");
            }

        } catch (error) {
            console.error(error);
            addToast("Failed to generate email.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text, type) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            addToast(`${type === 'subject' ? 'Subject' : 'Body'} copied to clipboard.`, 'success');
        } catch (err) {
            addToast("Failed to copy.", "error");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                message={upgradeMessage}
            />

            {/* LEFT COLUMN: INPUT FORM (Span 5) */}
            <div className="lg:col-span-5 space-y-6">
                <div className="glass-panel p-1 rounded-2xl border-white/10 bg-black/40 backdrop-blur-xl ring-1 ring-white/5">
                    <div className="bg-white/5 rounded-xl p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20 flex items-center justify-center border border-white/10">
                                <Sparkles className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Draft Details</h2>
                                <p className="text-xs text-neutral-400">Configure your outreach</p>
                            </div>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-5">
                            {/* Tone Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Tone & Style</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Professional', 'Friendly', 'Direct'].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, tone: t }))}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200",
                                                formData.tone === t
                                                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                                    : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Job Info Group */}
                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 group">
                                        <label className="flex items-center gap-2 text-xs font-medium text-neutral-400 group-focus-within:text-blue-400 transition-colors">
                                            <Briefcase className="w-3.5 h-3.5" /> Company <span className="text-red-400/80">*</span>
                                        </label>
                                        <input
                                            name="company"
                                            required
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="Acme Inc."
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500/50 focus:bg-white/5 outline-none transition-all placeholder:text-neutral-600"
                                        />
                                    </div>
                                    <div className="space-y-1.5 group">
                                        <label className="flex items-center gap-2 text-xs font-medium text-neutral-400 group-focus-within:text-purple-400 transition-colors">
                                            <User className="w-3.5 h-3.5" /> Recipient
                                        </label>
                                        <input
                                            name="recipientName"
                                            value={formData.recipientName}
                                            onChange={handleChange}
                                            placeholder="Jane Doe"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500/50 focus:bg-white/5 outline-none transition-all placeholder:text-neutral-600"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 group">
                                    <label className="flex items-center gap-2 text-xs font-medium text-neutral-400 group-focus-within:text-green-400 transition-colors">
                                        <Briefcase className="w-3.5 h-3.5" /> Job Title <span className="text-red-400/80">*</span>
                                    </label>
                                    <input
                                        name="jobTitle"
                                        required
                                        value={formData.jobTitle}
                                        onChange={handleChange}
                                        placeholder="Product Designer"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-green-500/50 focus:bg-white/5 outline-none transition-all placeholder:text-neutral-600"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5 group pt-2">
                                <label className="flex items-center gap-2 text-xs font-medium text-neutral-400 group-focus-within:text-white transition-colors">
                                    <FileText className="w-3.5 h-3.5" /> Context Snippet
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Paste a key requirement or sentence about the role to make the email more specific..."
                                    className="w-full h-28 bg-black/20 border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:border-white/30 focus:bg-white/5 outline-none transition-all placeholder:text-neutral-600 resize-none leading-relaxed"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={cn(
                                    "w-full h-12 text-sm font-semibold rounded-xl shadow-lg transition-all duration-300 relative overflow-hidden group",
                                    isLoading ? "bg-white/10 text-white cursor-wait" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] hover:shadow-blue-500/20 text-white"
                                )}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Writing Magic...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Generate Email
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: PREVIEW WINDOW (Span 7) */}
            <div className="lg:col-span-7 h-full min-h-[500px] flex flex-col">
                <div className={cn(
                    "flex-1 rounded-2xl border border-white/10 bg-[#0F0F12]/80 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-500 flex flex-col relative",
                    isLoading ? "opacity-90 scale-[0.99]" : "opacity-100 scale-100"
                )}>
                    {/* Fake Mac Window Header */}
                    <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between shrink-0">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="text-xs font-medium text-neutral-500 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            New Message
                        </div>
                        <div className="w-10" /> {/* Spacer */}
                    </div>

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
                            <p className="text-sm text-neutral-300 animate-pulse">Crafting best-in-class copy...</p>
                        </div>
                    )}

                    {!generatedEmail && !isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-50">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                                <Send className="w-8 h-8 text-neutral-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-neutral-300">Ready to write</h3>
                                <p className="text-sm text-neutral-500 max-w-xs mx-auto mt-2">Fill in the details on the left and we&apos;ll create a tailored draft for you.</p>
                            </div>
                        </div>
                    )}

                    {/* Email Content Area */}
                    {generatedEmail && (
                        <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
                            {/* Metadata Header */}
                            <div className="px-6 py-4 space-y-3 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-neutral-500 w-16 text-right">To:</span>
                                    <span className="text-sm text-white bg-white/10 px-2 py-0.5 rounded text-opacity-90">
                                        {formData.recipientName || "Hiring Manager"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <span className="text-sm text-neutral-500 w-16 text-right group-hover:text-blue-400 transition-colors">Subject:</span>
                                    <div className="flex-1 flex items-center gap-2">
                                        <input
                                            value={generatedEmail.subject}
                                            onChange={(e) => setGeneratedEmail(prev => ({ ...prev, subject: e.target.value }))}
                                            className="flex-1 bg-transparent border-none outline-none text-sm text-white font-medium placeholder:text-neutral-600"
                                            placeholder="Subject line..."
                                        />
                                        <button
                                            onClick={() => copyToClipboard(generatedEmail.subject, 'subject')}
                                            className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                            title="Copy Subject"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Email Body */}
                            <div className="flex-1 relative group">
                                <textarea
                                    value={generatedEmail.body}
                                    onChange={(e) => setGeneratedEmail(prev => ({ ...prev, body: e.target.value }))}
                                    className="w-full h-full bg-transparent p-6 text-neutral-200 text-[15px] leading-relaxed resize-none outline-none font-sans"
                                    spellCheck={false}
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyToClipboard(generatedEmail.body, 'body')}
                                        className="h-8 text-xs gap-2 bg-black/40 backdrop-blur-md border-white/10 hover:bg-white/10 hover:text-white"
                                    >
                                        <Copy className="w-3 h-3" /> Copy Body
                                    </Button>
                                </div>
                            </div>

                            {/* Toolbar Footer */}
                            <div className="h-12 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Draft Saved Locally</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setGeneratedEmail(null)}
                                    className="h-8 text-[10px] text-neutral-500 hover:text-red-400 gap-1"
                                >
                                    <RefreshCw className="w-3 h-3" /> Clear
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

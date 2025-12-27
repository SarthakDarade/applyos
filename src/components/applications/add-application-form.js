'use client';

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import { UpgradeModal } from '@/components/ui/upgrade-modal';

export function AddApplicationForm({ onCancel }) {
    const supabase = createClient();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Upgrade Modal State
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');

    const [formData, setFormData] = useState({
        company: '',
        title: '',
        location: '',
        platform: 'Other',
        application_link: '',
        application_id: '',
        status: 'applied',
        applied_at: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Convert state to FormData for Server Action
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });

        try {
            // Import dynamically or assuming available since it is a client component
            const { addApplication } = await import('@/lib/actions/applications'); // Dynamic import for client components

            const result = await addApplication(data);

            if (!result.success) {
                if (result.error && result.error.includes("Limit")) {
                    setUpgradeMessage(result.error);
                    setShowUpgrade(true);
                    // Note: We do NOT close the form so they don't lose data
                } else {
                    alert(result.error);
                }
                return;
            }

            router.refresh();
            onCancel(); // Close modal
        } catch (error) {
            console.error('Error adding application:', error);
            alert('Failed to add application. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                message={upgradeMessage}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-black border border-white/10 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">Track New Application</h2>
                        <button onClick={onCancel} className="text-neutral-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-400 uppercase">Company <span className="text-red-400">*</span></label>
                                <input
                                    name="company"
                                    required
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="e.g. Google"
                                    className="glass-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-400 uppercase">Job Title <span className="text-red-400">*</span></label>
                                <input
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Dev"
                                    className="glass-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-400 uppercase">Platform</label>
                                <select
                                    name="platform"
                                    value={formData.platform}
                                    onChange={handleChange}
                                    className="glass-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none appearance-none"
                                >
                                    <option value="LinkedIn" className="bg-neutral-900">LinkedIn</option>
                                    <option value="Indeed" className="bg-neutral-900">Indeed</option>
                                    <option value="Company Site" className="bg-neutral-900">Company Site</option>
                                    <option value="Wellfound" className="bg-neutral-900">Wellfound</option>
                                    <option value="Other" className="bg-neutral-900">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-400 uppercase">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="glass-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none appearance-none"
                                >
                                    <option value="applied" className="bg-neutral-900">Applied</option>
                                    <option value="interviewing" className="bg-neutral-900">Interviewing</option>
                                    <option value="offer" className="bg-neutral-900">Offer</option>
                                    <option value="rejected" className="bg-neutral-900">Rejected</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-400 uppercase">Tracking Link</label>
                            <input
                                name="application_link"
                                value={formData.application_link}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="glass-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-400 uppercase">Application ID / Number</label>
                            <input
                                name="application_id"
                                value={formData.application_id}
                                onChange={handleChange}
                                placeholder="e.g. APP-123456"
                                className="glass-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-white text-black hover:bg-neutral-200"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Application'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

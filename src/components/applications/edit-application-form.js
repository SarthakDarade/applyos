'use client';

import { useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { updateApplication } from '@/lib/actions/applications';

export function EditApplicationForm({ app, onCancel }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const isManual = app.is_manual;

    const [formData, setFormData] = useState({
        company: app.jobs.company || '',
        title: app.jobs.title || '',
        platform: app.jobs.platform || 'Other', // Assuming platform might be in jobs object for manual, if not logic handles it
        application_link: app.jobs.apply_url || '',
        application_id: app.application_id_ref || '', // This might need a new field in query if not getting pulled
        status: app.status || 'applied',
        applied_at: app.applied_at ? new Date(app.applied_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        data.append('id', app.id);
        data.append('is_manual', isManual);

        Object.entries(formData).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });

        try {
            const result = await updateApplication(data);

            if (!result.success) {
                alert(result.error);
                return;
            }

            router.refresh();
            onCancel();
        } catch (error) {
            console.error('Error updating application:', error);
            alert('Failed to update application.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-black border border-white/10 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Edit Application</h2>
                    <button onClick={onCancel} className="text-neutral-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Status is always editable */}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-400 uppercase">Company</label>
                            <input
                                name="company"
                                required
                                disabled={!isManual}
                                value={formData.company}
                                onChange={handleChange}
                                className="glass-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-400 uppercase">Job Title</label>
                            <input
                                name="title"
                                required
                                disabled={!isManual}
                                value={formData.title}
                                onChange={handleChange}
                                className="glass-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {isManual && (
                        <>
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
                                    <label className="text-xs font-medium text-neutral-400 uppercase">Date Applied</label>
                                    <input
                                        type="date"
                                        name="applied_at"
                                        value={formData.applied_at}
                                        onChange={handleChange}
                                        className="glass-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none"
                                    />
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
                        </>
                    )}

                    {!isManual && (
                        <p className="text-xs text-neutral-500 italic">
                            Details for system-tracked applications are managed automatically. You can only update the status.
                        </p>
                    )}

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
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

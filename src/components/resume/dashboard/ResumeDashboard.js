'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Plus, Trash2, MoreVertical, Loader2, Copy, FileText, Search,
    Clock, Edit3, Sparkles, LayoutGrid, LayoutList, ArrowUpDown,
    Download, ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { calculateResumeScore, getScoreColor, getScoreColorBg } from '@/lib/resume/scorer';
import { ResumeTailorSection } from './ResumeTailorSection';
import { UpgradeModal } from '@/components/ui/upgrade-modal';

export function ResumeDashboard({ resumes = [], user, profile }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState(resumes);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'alpha'
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState({ title: '', message: '' });

    const isPro = profile?.subscription_plan === 'pro';

    // Derived State
    const filteredAndSortedList = useMemo(() => {
        let result = list.filter(r =>
            (r.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
        } else if (sortBy === 'alpha') {
            result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        return result;
    }, [list, searchQuery, sortBy]);

    // Actions
    const handleCreate = async () => {
        // Check Limit for Free Users (5 Resumes)
        if (!isPro && list.length >= 5) {
            setUpgradeReason({
                title: "Resume limit reached",
                message: "Free users can create up to 5 resumes. Upgrade to Pro for unlimited resumes and advanced tailoring tools."
            });
            setShowUpgradeModal(true);
            return;
        }

        setLoading(true);
        try {
            // Start with a blank slate, only pre-filling identity from Auth
            const initialData = {
                personal: {
                    name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                    email: user.email || '',
                    phone: '',
                    linkedin: '',
                    website: '',
                    location: '',
                    title: ''
                },
                summary: '',
                experience: [],
                education: [],
                skills: [],
                projects: [],
                achievements: [],
                certifications: [],
                awards: [],
                research: [],
                publications: [],
                leadership: [],
                objective: ''
            };

            const { data, error } = await supabase
                .from('resumes')
                .insert({
                    user_id: user.id,
                    title: 'Untitled Resume',
                    data: initialData
                })
                .select()
                .single();

            if (error) throw error;
            router.push(`/resume/${data.id}`);
        } catch (error) {
            console.error('Error creating resume:', error);
            // alert('Failed to create resume. Please try again.'); // Optional: using toast is better if available
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        // Find the resume to confirm details (optional, but good for UI)
        const target = list.find(r => r.id === id);
        setDeleteTarget(target || { id });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        const id = deleteTarget.id;
        // Optimistic update
        const originalList = [...list]; // Store current list for potential revert
        setList(prev => prev.filter(r => r.id !== id)); // Use setList
        setDeleteTarget(null); // Close modal

        try {
            const { error } = await supabase.from('resumes').delete().eq('id', id);
            if (error) throw error;
            router.refresh();
        } catch (error) {
            console.error('Error deleting resume:', error);
            // Revert on error
            setList(originalList); // Use setList
            // toast here if we had one in this component
            alert('Failed to delete resume'); // Fallback purely for safety if toast not available
        }
    };

    const handleDuplicate = async (resume, e) => {
        e.stopPropagation();

        // Check Limit for Free Users (5 Resumes)
        if (!isPro && list.length >= 5) {
            setUpgradeReason({
                title: "Resume limit reached",
                message: "Free users can create up to 5 resumes. Upgrade to Pro for unlimited resumes and advanced tailoring tools."
            });
            setShowUpgradeModal(true);
            return;
        }

        const toastId = `dup-${Date.now()}`;

        try {
            const { data, error } = await supabase
                .from('resumes')
                .insert({
                    user_id: user.id,
                    title: `${resume.title} (Copy)`,
                    data: resume.data
                })
                .select()
                .single();

            if (error) throw error;
            setList([data, ...list]);
        } catch (error) {
            console.error('Duplicate failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 pb-20">
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title={upgradeReason.title}
                message={upgradeReason.message}
            />
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-[1000px] h-[400px] bg-blue-900/10 rounded-[100%] blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-900/5 rounded-[100%] blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-2"
                        >
                            Resumes
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-neutral-500 font-medium"
                        >
                            Manage your resumes in one place.
                        </motion.p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="hidden md:flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-neutral-200 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />}
                            Create Resume
                        </button>
                    </div>
                </div>

                {/* Resume Tailor Generator Section */}
                <ResumeTailorSection resumes={list} profile={profile} />

                {/* Toolbar */}
                <div className="sticky top-4 z-50 mb-8">
                    <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-2 flex flex-col sm:flex-row items-center gap-2 shadow-2xl">
                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title..."
                                className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder-neutral-600 h-10 pl-10 focus:outline-none"
                            />
                        </div>

                        <div className="h-6 w-px bg-white/10 hidden sm:block" />

                        {/* Controls */}
                        <div className="flex items-center gap-1 w-full sm:w-auto justify-end px-2">
                            {/* Sort Dropdown (Simplified) */}
                            <button
                                onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : prev === 'oldest' ? 'alpha' : 'newest')}
                                className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                title={`Sort: ${sortBy}`}
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                <span className="text-xs font-medium capitalize hidden sm:inline">{sortBy}</span>
                            </button>

                            <div className="h-4 w-px bg-white/10" />

                            {/* View Toggle */}
                            <div className="flex bg-black/20 rounded-lg p-0.5 border border-white/5">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-white")}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-white")}
                                >
                                    <LayoutList className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode='wait'>
                    {filteredAndSortedList.length === 0 && list.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <p className="text-neutral-500">No resumes found matching "{searchQuery}"</p>
                        </motion.div>
                    ) : filteredAndSortedList.length === 0 && !loading ? (
                        <EmptyState onCreate={handleCreate} />
                    ) : (
                        <motion.div
                            layout
                            className={cn(
                                "grid gap-6",
                                viewMode === 'grid'
                                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                    : "grid-cols-1"
                            )}
                        >
                            {/* Create Card (Only in Grid) */}
                            {viewMode === 'grid' && !searchQuery && (
                                <motion.button
                                    layout
                                    onClick={handleCreate}
                                    className="group relative h-[400px] rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/10 hover:bg-neutral-900/30 hover:border-neutral-700 transition-all flex flex-col items-center justify-center text-center p-6"
                                >
                                    <div className="w-16 h-16 rounded-full bg-neutral-800 group-hover:bg-blue-600/20 group-hover:scale-110 transition-all flex items-center justify-center mb-4 text-neutral-500 group-hover:text-blue-400">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-1">New Resume</h3>
                                    <p className="text-sm text-neutral-500">Starts with your profile</p>
                                </motion.button>
                            )}

                            {filteredAndSortedList.map((resume) => (
                                <ResumeCard
                                    key={resume.id}
                                    resume={resume}
                                    viewMode={viewMode}
                                    router={router}
                                    onDelete={handleDelete}
                                    onDuplicate={handleDuplicate}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setDeleteTarget(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-neutral-900 border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4"
                        >
                            <div className="flex items-center gap-3 text-red-400">
                                <div className="p-2 bg-red-400/10 rounded-lg">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg text-white">Delete Resume?</h3>
                            </div>
                            <p className="text-neutral-400">
                                Are you sure you want to delete <span className="text-white font-medium">"{deleteTarget.title || 'Untitled'}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg shadow-red-500/20"
                                >
                                    Delete Resume
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EmptyState({ onCreate }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center"
        >
            <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-full h-full bg-neutral-900 border border-neutral-800 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-12 h-12 text-blue-400" />
                </div>
                {/* Floating Elements */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute -top-4 -right-4 bg-neutral-800 p-2 rounded-lg border border-neutral-700 shadow-xl"
                >
                    <FileText className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                    className="absolute -bottom-2 -left-4 bg-neutral-800 p-2 rounded-lg border border-neutral-700 shadow-xl"
                >
                    <Edit3 className="w-5 h-5 text-purple-400" />
                </motion.div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">Create your first resume</h2>
            <p className="text-neutral-400 max-w-md mb-8 text-lg">
                Craft a professional resume in minutes. We'll use your profile data to get you started instantly.
            </p>
            <button
                onClick={onCreate}
                className="bg-white text-black px-8 py-3.5 rounded-full font-bold text-base hover:bg-neutral-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Start Building
            </button>
        </motion.div>
    );
}

function ResumeCard({ resume, viewMode, router, onDelete, onDuplicate }) {
    const updatedAt = resume.updated_at ? new Date(resume.updated_at) : new Date();
    const name = resume.data?.personal?.name || 'Your Name';
    const role = resume.data?.personal?.title || 'Professional Title';

    // Calculate Score
    const { score } = calculateResumeScore(resume.data);
    const scoreColor = getScoreColor(score);
    const scoreBg = getScoreColorBg(score);
    const showScore = score >= 40;

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                onClick={() => router.push(`/resume/${resume.id}`)}
                className="group flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 transition-all cursor-pointer"
            >
                {/* Icon Preview */}
                <div className="w-12 h-16 bg-white shrink-0 rounded-sm shadow-sm flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-2 left-2 right-2 h-[2px] bg-black/10" />
                    <div className="absolute top-3 left-2 right-4 h-[2px] bg-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate text-base">{resume.title || 'Untitled Resume'}</h3>
                    <p className="text-sm text-neutral-500 truncate">Edited {formatDistanceToNow(updatedAt)} ago</p>
                </div>

                {/* Score Badge List View */}
                {showScore && (
                    <div className="flex items-center gap-2 px-4 border-l border-white/5">
                        <div className="text-xs text-neutral-500 font-medium">Score</div>
                        <div className={`text-sm font-bold ${scoreColor}`}>{score}%</div>
                    </div>
                )}

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                    <button onClick={(e) => onDuplicate(resume, e)} className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg" title="Duplicate"><Copy className="w-4 h-4" /></button>
                    <button onClick={(e) => onDelete(resume.id, e)} className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
            </motion.div>
        );
    }

    // GRID VIEW
    return (
        <motion.div
            layout
            onClick={() => router.push(`/resume/${resume.id}`)}
            className="group relative flex flex-col h-[400px] rounded-2xl bg-[#0a0a0a] border border-neutral-800/80 hover:border-neutral-600 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
        >
            {/* Absolute Badges */}
            <div className="absolute top-3 left-3 z-20 flex gap-2">
                {/* Score Badge */}
                {showScore && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
                        <div className={`w-2 h-2 rounded-full ${scoreBg} animate-pulse`} />
                        <span className={`text-xs font-bold ${scoreColor}`}>{score}%</span>
                    </div>
                )}
            </div>

            {/* Context Menu (Absolute Top Right) */}
            <div className="absolute top-3 right-3 z-20 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                    onClick={(e) => { e.stopPropagation(); onDuplicate(resume, e); }}
                    className="p-2 bg-neutral-900/80 backdrop-blur text-neutral-400 hover:text-white rounded-lg border border-white/10 hover:bg-neutral-800 transition-colors shadow-lg"
                    title="Duplicate"
                >
                    <Copy className="w-3.5 h-3.5" />
                </div>
                <div
                    onClick={(e) => { e.stopPropagation(); onDelete(resume.id, e); }}
                    className="p-2 bg-neutral-900/80 backdrop-blur text-neutral-400 hover:text-red-400 rounded-lg border border-white/10 hover:bg-neutral-800 transition-colors shadow-lg"
                    title="Delete"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </div>
            </div>

            {/* PREVIEW CONTAINER (Paper aspect ratio) */}
            <div className="flex-1 bg-neutral-900/20 relative p-6 flex items-center justify-center overflow-hidden">
                {/* The Paper */}
                <div className="w-[85%] h-[90%] bg-white rounded-sm shadow-xl relative overflow-hidden flex flex-col group-hover:scale-[1.02] transition-transform duration-500">

                    {/* Decor Header */}
                    <div className="h-24 bg-neutral-50 border-b border-neutral-100 p-4 flex flex-col justify-end">
                        <div className="h-4 bg-neutral-900 w-3/4 mb-1.5 opacity-80" />
                        <div className="h-2 bg-neutral-400 w-1/2 opacity-60" />
                    </div>

                    {/* Content Mockup */}
                    <div className="p-4 space-y-3 flex-1 opacity-40">
                        {/* Columns */}
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="h-2 bg-black w-1/3 mb-2" />
                                <div className="h-1 bg-neutral-400 w-full" />
                                <div className="h-1 bg-neutral-400 w-full" />
                                <div className="h-1 bg-neutral-400 w-5/6" />
                            </div>
                            <div className="w-1/4 space-y-2">
                                <div className="h-2 bg-black w-1/2 mb-2" />
                                <div className="h-1 bg-neutral-400 w-full" />
                                <div className="h-1 bg-neutral-400 w-full" />
                            </div>
                        </div>
                        <div className="h-px bg-neutral-200 w-full my-2" />
                        <div className="space-y-2">
                            <div className="h-2 bg-black w-1/4 mb-2" />
                            <div className="h-1 bg-neutral-400 w-full" />
                            <div className="h-1 bg-neutral-400 w-11/12" />
                            <div className="h-1 bg-neutral-400 w-full" />
                        </div>
                        <div className="space-y-2 mt-4">
                            <div className="h-2 bg-black w-1/4 mb-2" />
                            <div className="h-1 bg-neutral-400 w-full" />
                            <div className="h-1 bg-neutral-400 w-11/12" />
                            <div className="h-1 bg-neutral-400 w-full" />
                        </div>
                    </div>

                    {/* Overlay Text */}
                    <div className="absolute inset-x-0 top-0 bg-white/95 backdrop-blur-sm p-4 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300 border-b border-neutral-100 z-10">
                        <h4 className="font-bold text-black text-sm truncate">{name}</h4>
                        <p className="text-xs text-neutral-500 truncate">{role}</p>
                    </div>

                    {/* Edit Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                        <button className="bg-neutral-900 text-white px-5 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                            <Edit3 className="w-4 h-4" /> Edit Resume
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-[#0a0a0a] relative z-10">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-white truncate text-base flex-1 pr-2 group-hover:text-blue-400 transition-colors" title={resume.title}>
                        {resume.title || 'Untitled Resume'}
                    </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="w-3 h-3" />
                    <span>Edited {formatDistanceToNow(updatedAt)} ago</span>
                </div>
            </div>
        </motion.div>
    );
}

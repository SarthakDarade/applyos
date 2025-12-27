
'use client';

import { useRef, useState, useEffect, useCallback } from 'react'; // Consolidated import
import { getTemplate } from '@/lib/resume/templates';
import { Download, FileCode, Printer, CheckCircle2, Cloud, AlertTriangle, Loader2, ArrowLeft, Trophy, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { ToastProvider, useToast } from '@/components/ui/toast-context';
import { LeftPanel } from './LeftPanel';
import { transformToSectionFormat, transformToFlatFormat } from '@/lib/resume/structure';
import { calculateResumeScore, getScoreColor, getScoreColorBg } from '@/lib/resume/scorer';

export function ResumeEditor({ resume, initialData, user }) {
    // Determine initial data source: 'resume' record or 'initialData' prop (legacy/fallback)
    // If 'resume' is provided, it has { id, title, data }
    return (
        <ToastProvider>
            <ResumeEditorContent resume={resume} initialData={initialData} user={user} />
        </ToastProvider>
    );
}

function ResumeEditorContent({ resume, initialData, user }) {
    const { addToast } = useToast();

    // -------------------------------------------------------------------------
    // STATE
    // -------------------------------------------------------------------------
    // Use resume.data or fallback to initialData
    const [resumeJson, setResumeJson] = useState(() =>
        transformToSectionFormat(resume?.data || initialData?.data)
    );
    const [title, setTitle] = useState(resume?.title || 'Untitled Resume');

    // Resume ID is critical for saving
    const resumeId = resume?.id;

    const [isSaving, setIsSaving] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [activeTemplateId] = useState('jv');

    const [activeSectionId, setActiveSectionId] = useState(null);
    const [deleteItemTarget, setDeleteItemTarget] = useState(null);

    // Autosave Timer ref
    const saveTimeoutRef = useRef(null);

    // -------------------------------------------------------------------------
    // PREVIEW DATA
    // -------------------------------------------------------------------------
    const previewData = transformToFlatFormat(resumeJson);
    const Template = getTemplate(activeTemplateId);
    const ResumeComponent = Template.component;

    // -------------------------------------------------------------------------
    // AUTOSAVE LOGIC
    // -------------------------------------------------------------------------
    const resumeJsonRef = useRef(resumeJson);
    const titleRef = useRef(title);

    useEffect(() => {
        resumeJsonRef.current = resumeJson;
        titleRef.current = title;
    }, [resumeJson, title]);

    const saveToSupabase = useCallback(async () => {
        const currentData = resumeJsonRef.current;
        const currentTitle = titleRef.current;

        if (!user) {
            console.error("User missing");
            return;
        }

        if (!currentData) return;

        console.log("Saving resume...", resumeId);
        setIsSaving(true);
        try {
            const supabase = createClient();

            let error;

            if (resumeId) {
                // Update existing resume by ID
                const { error: updateError } = await supabase
                    .from('resumes')
                    .update({
                        data: currentData,
                        title: currentTitle,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', resumeId);
                error = updateError;
            } else {
                // Fallback for legacy single-resume mode (upsert by user_id)
                // This shouldn't be hit in the new flow but kept for safety
                const { error: upsertError } = await supabase
                    .from('resumes')
                    .upsert({
                        user_id: user.id,
                        data: currentData,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });
                error = upsertError;
            }

            if (error) throw error;

            console.log("Save successful");
            addToast("Saved", "success");

            setLastSaved(new Date());
            setHasUnsavedChanges(false);
            setIsSaving(false);

        } catch (e) {
            console.error("Critical Save Error:", e);
            setIsSaving(false);
            addToast(`Save failed: ${e.message}`, "error");
        }
    }, [user, addToast, resumeId]);

    // Debounced Save Effect
    useEffect(() => {
        if (hasUnsavedChanges) {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => {
                saveToSupabase();
            }, 2000);
        }
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [hasUnsavedChanges, saveToSupabase]);

    const handleChange = (newJson) => {
        setResumeJson(newJson);
        setHasUnsavedChanges(true);
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setHasUnsavedChanges(true); // Trigger autosave on title change too
    };

    // -------------------------------------------------------------------------
    // ACTIONS
    // -------------------------------------------------------------------------
    const handleCompilePdf = async () => {
        setIsCompiling(true);
        addToast("Generating PDF...", "info");
        try {
            const source = Template.generateLatex(previewData);
            const response = await fetch('/api/compile-latex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source })
            });

            if (!response.ok) throw new Error("Compilation failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(title || 'resume').replace(/\s+/g, '_')}.pdf`;
            a.click();
            addToast("PDF downloaded", "success");
        } catch (e) {
            console.error(e);
            addToast("PDF Generation Failed", "error");
        } finally {
            setIsCompiling(false);
        }
    };

    // -------------------------------------------------------------------------
    // PREVIEW ACTIONS (Add/Edit items from Preview click)
    // -------------------------------------------------------------------------
    const handleAddPreviewItem = (sectionId, newItem) => {
        setActiveSectionId(sectionId);
        setResumeJson(prev => {
            const sections = prev.sections.map(sec => {
                if (sec.id === sectionId) {
                    const updatedItems = [...(sec.items || [])];
                    updatedItems.push(newItem);
                    return { ...sec, items: updatedItems, enabled: true };
                }
                return sec;
            });
            return { ...prev, sections };
        });
        setHasUnsavedChanges(true);
        addToast(`Added item to ${sectionId}`, "success");
    };

    const handleEditPreviewItem = (path) => {
        if (!path) return;
        setActiveSectionId(path.split('.')[0]);
    };

    const handleDeletePreviewItem = (path, index) => {
        setDeleteItemTarget({ path, index });
    };

    const confirmDeletePreviewItem = () => {
        if (!deleteItemTarget) return;
        const { path, index } = deleteItemTarget;

        setResumeJson(prev => {
            const sections = prev.sections.map(sec => {
                if (sec.id === path) {
                    const updatedItems = [...(sec.items || [])];
                    updatedItems.splice(index, 1);
                    return { ...sec, items: updatedItems };
                }
                return sec;
            });
            return { ...prev, sections };
        });
        setHasUnsavedChanges(true);
        setDeleteItemTarget(null);
        addToast("Item deleted", "success");
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col h-screen bg-neutral-950 text-white overflow-hidden font-sans animation-fade-in">
            {/* Top Toolbar */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-neutral-900/95 backdrop-blur-md z-20 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <a href="/resume" className="p-2 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors" title="Back to Dashboard">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                            <FileCode className="w-5 h-5" />
                        </div>
                        <div>
                            {/* Title Input */}
                            <input
                                value={title}
                                onChange={handleTitleChange}
                                className="bg-transparent text-base font-bold text-white leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -ml-1 transition-all placeholder-neutral-600 w-64 hover:bg-white/5"
                                placeholder="Untitled Resume"
                            />
                            <button
                                onClick={saveToSupabase}
                                disabled={isSaving || !hasUnsavedChanges}
                                className={cn(
                                    "text-[11px] flex items-center gap-1.5 font-medium transition-colors outline-none",
                                    hasUnsavedChanges ? "text-amber-400 hover:text-amber-300 cursor-pointer" : "text-neutral-400 cursor-default"
                                )}
                            >
                                <span className={cn("w-1.5 h-1.5 rounded-full", hasUnsavedChanges ? "bg-amber-500" : "bg-green-500")} />
                                {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved Changes' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Ready'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Score Indicator */}
                    {/* Score Indicator */}
                    <div className="group relative">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 mr-2 cursor-help hover:bg-white/10 transition-colors">
                            <Trophy className={`w-3.5 h-3.5 ${getScoreColor(calculateResumeScore(previewData).score)}`} />
                            <span className="text-xs text-neutral-400 font-medium">Score:</span>
                            <span className={`text-sm font-bold ${getScoreColor(calculateResumeScore(previewData).score)}`}>
                                {calculateResumeScore(previewData).score}
                            </span>
                        </div>

                        {/* Score Breakdown Popover */}
                        <div className="absolute top-full right-0 mt-2 w-64 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 translate-y-2 group-hover:translate-y-0">
                            <h4 className="text-xs font-bold text-neutral-400 mb-3 uppercase tracking-wider">Score Breakdown</h4>
                            <div className="space-y-3">
                                {['ats', 'content', 'optimization', 'writing', 'ready'].map(cat => {
                                    const score = calculateResumeScore(previewData).breakdown?.[cat] || 0;
                                    const label = cat === 'ats' ? 'ATS & Structure' : cat === 'ready' ? 'Application Ready' : cat.charAt(0).toUpperCase() + cat.slice(1);
                                    return (
                                        <div key={cat} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-neutral-300">{label}</span>
                                                <span className={getScoreColor(score)}>{score}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${getScoreColorBg(score)}`}
                                                    style={{ width: `${score}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCompilePdf}
                        disabled={isCompiling}
                        className={cn(
                            "group flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-full transition-all border shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
                            isCompiling
                                ? "bg-neutral-800 text-neutral-400 border-neutral-700 cursor-not-allowed"
                                : "bg-white text-black hover:bg-neutral-200 border-transparent shadow-white/10"
                        )}
                    >
                        {isCompiling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span>{isCompiling ? 'Generating...' : 'Download PDF'}</span>
                    </button>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* LEFT PANEL: Editor */}
                <LeftPanel
                    resumeJson={resumeJson}
                    onChange={handleChange}
                    onAutoSave={saveToSupabase}
                    activeSectionId={activeSectionId}
                    setActiveSectionId={setActiveSectionId}
                />

                {/* RIGHT PANEL: Preview */}
                <PreviewPanel
                    data={previewData}
                    component={ResumeComponent}
                    isCompiling={isCompiling}
                    activeSectionId={activeSectionId}
                    onAdd={handleAddPreviewItem}
                    onEdit={handleEditPreviewItem}
                    onDelete={handleDeletePreviewItem}
                />
            </div>

            <AnimatePresence>
                {deleteItemTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setDeleteItemTarget(null)}
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
                                <h3 className="font-bold text-lg text-white">Delete Item?</h3>
                            </div>
                            <p className="text-neutral-400">
                                Are you sure you want to delete this item? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setDeleteItemTarget(null)}
                                    className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeletePreviewItem}
                                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg shadow-red-500/20"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Separate component for easier state management of the preview
function PreviewPanel({ data, component: ResumeComponent, isCompiling, activeSectionId, onAdd, onEdit, onDelete }) {
    const [scale, setScale] = useState(0.85); // Increased default scale
    const previewRef = useRef(null);

    // Watch for activeSectionId changes and scroll to it
    useEffect(() => {
        if (activeSectionId && previewRef.current) {
            // NOTE: The template components (JV Template) must implement IDs corresponding to section names
            // e.g., id="experience", id="education"
            // We'll assume the template has these IDs.
            const element = previewRef.current.querySelector(`#${activeSectionId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Add a temporary highlight effect
                element.style.transition = 'background-color 0.5s';
                const originalBg = element.style.backgroundColor;
                element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                setTimeout(() => {
                    element.style.backgroundColor = originalBg;
                }, 1500);
            }
        }
    }, [activeSectionId]);

    // Zoom handlers
    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.4));

    return (
        <div className="flex-1 bg-[#0c0c0c] flex flex-col h-full overflow-hidden relative border-l border-white/5 shadow-2xl z-10">
            {/* Preview Toolbar */}
            <div className="h-12 border-b border-white/5 bg-neutral-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20 w-full absolute top-0 left-0 right-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider">Live Preview</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-black/60 rounded-lg p-1 border border-white/10 backdrop-blur-md shadow-lg">
                    <button
                        onClick={zoomOut}
                        className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-md transition-colors"
                        title="Zoom Out"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-neutral-300 w-12 text-center select-none font-medium">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-md transition-colors"
                        title="Zoom In"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Scrollable Workspace */}
            <div
                className="flex-1 overflow-auto flex items-start justify-center p-8 md:p-16 pt-24 pb-24 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-[#050505]"
                style={{
                    backgroundImage: 'radial-gradient(#1f1f1f 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            >
                <div className="flex flex-col items-center gap-4">
                    <div
                        ref={previewRef}
                        className="transition-transform duration-200 ease-out origin-top relative"
                        style={{
                            transform: `scale(${scale})`,
                        }}
                    >
                        {/* The Resume Content */}
                        <div className="w-full h-full text-left">
                            <ResumeComponent
                                data={data}
                                onEdit={onEdit}
                                onAdd={onAdd}
                                onDelete={onDelete}
                            />
                        </div>
                    </div>
                    <div className="text-neutral-500 text-[10px] font-medium tracking-wide uppercase opacity-60 select-none pb-8">
                        Preview is approximate. Download PDF for exact layout.
                    </div>
                </div>
            </div>

            {/* Overlay if compiling */}
            {isCompiling && (
                <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-neutral-900 border border-white/5 shadow-2xl">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 animate-ping absolute inset-0" />
                            <div className="w-12 h-12 rounded-full border-2 border-t-blue-500 animate-spin relative z-10" />
                        </div>
                        <span className="text-sm font-medium text-neutral-300 animate-pulse">Generating PDF...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

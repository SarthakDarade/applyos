'use client';

import { useState } from 'react';
import { ResumeUpload } from '@/components/resume/resume-upload';
import { ResumeForm } from '@/components/resume/resume-form';
import { ResumeTemplate } from '@/components/resume/resume-template';
import { FileText, Edit, Upload, Download } from 'lucide-react';
import { SocialProof } from '@/components/resume/social-proof';
import { UpgradeModal } from '@/components/ui/upgrade-modal';

export function ResumePageClient({ initialResume, user }) {
    const [view, setView] = useState(initialResume?.data ? 'preview' : 'edit'); // 'preview', 'edit'
    const [resumeData, setResumeData] = useState(initialResume?.data || null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Upgrade Modal State
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');

    const handleUploadComplete = (parsedData) => {
        setResumeData(parsedData);
        setView('edit'); // Go to edit after upload to verify
    };

    const handleSave = (savedData) => {
        setResumeData(savedData);
        setView('preview');
    };

    const handleDownload = async (type = 'pdf') => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/resume/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData, userId: user.id })
            });
            const result = await response.json();

            if (result.success) {
                if (type === 'latex') {
                    // Download Source
                    const blob = new Blob([result.source], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${resumeData.personal?.name.replace(/\s+/g, '_')}_resume.tex`;
                    a.click();
                } else if (result.pdfBase64) {
                    // Download Generated PDF from Buffer
                    const byteCharacters = atob(result.pdfBase64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');
                } else if (!result.url) {
                    // Fallback to Browser Print if no URL/Buffer returned (e.g. compilation failed)
                    console.warn("LaTeX compilation failed/skipped, falling back to browser print.");
                    window.print();
                }
            } else {
                console.error("Gen Error:", result.message);
                if (result.message && result.message.includes("Limit")) {
                    setUpgradeMessage(result.message);
                    setShowUpgrade(true);
                } else {
                    window.print();
                }
            }

        } catch (e) {
            console.error("PDF Gen Error:", e);
            if (type === 'pdf') window.print(); // Fallback
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 print:max-w-none print:p-0 print:m-0">
            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                message={upgradeMessage}
            />
            <SocialProof />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">My Resume</h1>
                    <p className="text-neutral-400 mt-1">Manage your structured resume profile</p>
                </div>

                {/* Sub Navigation */}
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                    <button
                        onClick={() => setView('preview')}
                        disabled={!resumeData}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${view === 'preview'
                            ? 'bg-white text-black shadow-lg'
                            : 'text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Preview
                    </button>
                    <button
                        onClick={() => setView('edit')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${view === 'edit'
                            ? 'bg-white text-black shadow-lg'
                            : 'text-neutral-400 hover:text-white'
                            }`}
                    >
                        <Edit className="w-4 h-4" />
                        Editor
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">

                {/* 1. Preview Mode */}
                {view === 'preview' && resumeData && (
                    <div className="space-y-6">
                        <div className="flex justify-end gap-3 print:hidden">

                            <button
                                onClick={() => handleDownload('pdf')}
                                disabled={isGenerating}
                                className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                                {isGenerating ? 'Compiling...' : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </>
                                )}
                            </button>


                        </div>
                        {/* Scaled Preview Wrapper */}
                        <div className="flex justify-center bg-neutral-900/50 p-8 rounded-xl border border-white/5 overflow-auto print:bg-white print:border-none print:p-0 print:overflow-visible">
                            <div className="origin-top scale-90 print:scale-100 print:origin-top-left">
                                <ResumeTemplate data={resumeData} />
                            </div>
                        </div>
                    </div>
                )}

                {/* 1b. Preview Empty State */}
                {view === 'preview' && !resumeData && (
                    <div className="text-center py-20 space-y-4">
                        <p className="text-neutral-400">No resume data found.</p>
                        <button onClick={() => setView('upload')} className="text-blue-400 hover:underline">
                            Upload a resume to get started
                        </button>
                    </div>
                )}

                {/* 2. Edit Mode */}
                {view === 'edit' && (
                    <ResumeForm initialData={resumeData} onSave={handleSave} />
                )}

            </div>
        </div>
    );
}

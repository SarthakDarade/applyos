'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function ResumeUpload({ onUploadComplete }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const supabase = createClient();

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) processFile(files[0]);
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) processFile(files[0]);
    };

    const processFile = async (file) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }

        setIsUploading(true);
        setError(null);

        // Mock Extraction for now
        // In a real system, you'd upload -> call API to parse -> return structured JSON
        // Here we'll simulate a parsing delay and return placeholder structured data
        try {

            // 1. Upload to Storage (Optional for source keeping, but we focus on Logic)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const path = `${user.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(path, file);

            if (uploadError) throw uploadError;

            // 2. Simulate Parsing (Wait 2s)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Return Mock Data
            const mockParsedData = {
                personal: {
                    name: user.user_metadata?.full_name || 'User Name',
                    email: user.email,
                    location: 'Remote',
                    linkedin: 'linkedin.com/in/user'
                },
                summary: "Experienced professional with a focus on delivering high-quality results.",
                experience: [
                    {
                        company: "Example Corp",
                        role: "Senior Developer",
                        dates: "2020 - Present",
                        description: ["Led a team of 5 developers.", "Improved system performance by 20%."]
                    }
                ],
                education: [],
                skills: {
                    technical: ["JavaScript", "React", "Node.js"],
                    soft: ["Leadership", "Communication"]
                },
                projects: []
            }

            onUploadComplete(mockParsedData);

        } catch (err) {
            console.error(err);
            setError('Failed to upload and parse resume. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragOver
                ? 'border-white bg-white/5'
                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resume-upload-input').click()}
        >
            <input
                type="file"
                id="resume-upload-input"
                className="hidden"
                accept=".pdf"
                onChange={handleFileSelect}
                disabled={isUploading}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
                {isUploading ? (
                    <>
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        </div>
                        <div>
                            <p className="font-medium text-white">Analyzing Resume...</p>
                            <p className="text-sm text-neutral-400">Extracting structured data</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                            <UploadCloud className="w-6 h-6 text-neutral-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white">Click or drag PDF to upload</p>
                            <p className="text-sm text-neutral-400">We&apos;ll parse it into structured data</p>
                        </div>
                    </>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client'

import { useState } from 'react'
import { Upload, Check, FileText, AlertCircle, RefreshCw, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { updateOnboardingStep } from '@/app/actions/onboarding'
import { logClientActivity } from '@/app/actions/logger'

export function ResumeUploader({ existingResume, mode = 'dashboard' }) {
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState(existingResume ? 'success' : 'idle')
    const [errorMessage, setErrorMessage] = useState('')
    const supabase = createClient()
    const router = useRouter()

    const handleContinue = async () => {
        try {
            // If skipping, just proceed
            if (!existingResume) {
                await updateOnboardingStep(1)
                router.push('/onboarding/step-2')
                return
            }

            // Silent Background Process
            // 1. Insert into internal tracking table
            const { data: { user } } = await supabase.auth.getUser()
            const { data: internalRecord, error: internalError } = await supabase
                .from('onboarding_resumes')
                .insert({
                    user_id: user.id,
                    resume_path: existingResume.file_path,
                    internal_status: 'pending'
                })
                .select()
                .single()

            if (!internalError && internalRecord) {
                // 2. Trigger Extraction (Fire & Forget)
                fetch('/api/extract-resume', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        resume_id: internalRecord.id,
                        resume_path: existingResume.file_path
                    })
                })
            }

            // 3. Navigate Immediately (Don't wait for fetch)
            await updateOnboardingStep(1)
            router.push('/onboarding/step-2')

        } catch (e) {
            console.error('Continue error:', e)
            // Fallback: Proceed even if background trigger failed
            router.push('/onboarding/step-2')
        }
    }

    // ... (rest of code)
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setStatus('error')
                setErrorMessage('Only PDF files are allowed.')
                return
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                setStatus('error')
                setErrorMessage('File size must be less than 5MB.')
                return
            }
            setFile(selectedFile)
            setStatus('idle')
            setErrorMessage('')
        }
    }

    const handleDelete = async () => {
        if (!existingResume) return
        setStatus('deleting')

        try {
            // 1. Remove from Storage
            const { error: storageError } = await supabase.storage
                .from('resumes')
                .remove([existingResume.file_path])

            if (storageError) throw storageError

            // 2. Remove from Database
            const { error: dbError } = await supabase
                .from('user_resumes')
                .delete()
                .eq('id', existingResume.id)

            if (dbError) throw dbError

            setFile(null)
            setStatus('idle')
            router.refresh()

        } catch (error) {
            console.error('Delete failed:', error)
            setStatus('error')
            setErrorMessage('Failed to delete resume.')
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setStatus('uploading')

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // ENFORCE ONE RESUME RULE: If one exists, delete it first (Atomic replacement)
            if (existingResume) {
                await supabase.storage.from('resumes').remove([existingResume.file_path])
                await supabase.from('user_resumes').delete().eq('id', existingResume.id)
            }

            const timestamp = Date.now()
            const filePath = `${user.id}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

            // 1. Upload file to Storage
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Insert record into Database
            const { error: dbError } = await supabase
                .from('user_resumes')
                .insert({
                    user_id: user.id,
                    file_path: filePath,
                    file_name: file.name,
                    status: 'uploaded'
                })

            if (dbError) throw dbError

            // Log Actions
            await logClientActivity(
                existingResume ? 'Replaced Resume' : 'Uploaded Resume',
                `Uploaded ${file.name}`
            )

            // Silent Extraction (Dashboard Mode Only)
            if (mode === 'dashboard') {
                const { data: internalRecord } = await supabase
                    .from('onboarding_resumes')
                    .insert({
                        user_id: user.id,
                        resume_path: filePath,
                        internal_status: 'pending'
                    })
                    .select()
                    .single()

                if (internalRecord) {
                    fetch('/api/extract-resume', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: user.id,
                            resume_id: internalRecord.id,
                            resume_path: filePath
                        })
                    })
                }
            }

            setStatus('success')
            router.refresh()

        } catch (error) {
            console.error('Upload failed:', error)
            setStatus('error')
            setErrorMessage('Upload failed. Please try again.')
        }
    }

    // Active/Success View
    if (status === 'success' && existingResume) {
        if (mode === 'onboarding') {
            return (
                <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center text-center h-full min-h-[320px] animate-in fade-in zoom-in duration-500">
                    <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                        <Check className="h-8 w-8" />
                    </div>
                    <h3 className="text-white font-medium text-xl">Resume Uploaded</h3>
                    <p className="text-neutral-400 mt-2 mb-8 max-w-[250px]">
                        {existingResume.file_name} is ready for analysis.
                    </p>
                    <Button
                        onClick={handleContinue}
                        variant="primary"
                        className="w-full max-w-[200px]"
                    >
                        Continue to Profile
                    </Button>
                </div>
            )
        }

        return (
            <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center h-full min-h-[280px] relative overflow-hidden group">
                <div className="h-16 w-16 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <Check className="h-8 w-8" />
                </div>
                <h3 className="text-white font-medium text-lg">Resume Active</h3>
                <p className="text-sm text-neutral-400 mt-2 mb-6 max-w-[200px] leading-relaxed truncate px-2">
                    {existingResume.file_name}
                </p>

                <div className="flex gap-3 absolute bottom-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        className="text-xs h-9 px-3 gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                </div>

                <p className="text-[10px] text-neutral-600 absolute bottom-6 group-hover:opacity-0 transition-opacity">
                    Hover to manage
                </p>
            </div>
        )
    }

    // Upload View
    return (
        <div className="glass-panel p-6 rounded-xl h-full flex flex-col min-h-[280px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-neutral-500" />
                    Resume
                </h3>
                {status === 'error' && (
                    <span className="text-xs text-red-400 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="h-3 w-3" /> {errorMessage || 'PDF only'}
                    </span>
                )}
            </div>

            <div className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-all duration-300 relative group
            ${file ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}
      `}>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={status === 'uploading' || status === 'deleting'}
                />

                {file ? (
                    <div className="text-center z-0 animate-in fade-in slide-in-from-bottom-2">
                        <div className="h-12 w-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-emerald-400 border border-emerald-500/20">
                            <FileText className="h-6 w-6" />
                        </div>
                        <p className="text-sm text-white font-medium truncate max-w-[180px] mx-auto">{file.name}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-6 text-xs text-neutral-400 hover:text-white z-20 relative pointer-events-none"
                        >
                            Click to change
                        </Button>
                    </div>
                ) : (
                    <div className="text-center z-0">
                        <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-neutral-400 group-hover:text-white transition-colors group-hover:scale-110 duration-300">
                            <Upload className="h-5 w-5" />
                        </div>
                        <p className="text-sm text-neutral-300 group-hover:text-white transition-colors">Click to upload PDF</p>
                        <p className="text-xs text-neutral-500 mt-1">Max 5MB</p>
                    </div>
                )}
            </div>

            {file && (
                <Button
                    onClick={handleUpload}
                    disabled={status === 'uploading'}
                    className="w-full mt-4 h-10 shadow-lg shadow-emerald-900/20"
                    variant="primary"
                >
                    {status === 'uploading' ? (
                        <span className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" /> Uploading...
                        </span>
                    ) : (
                        // Logic check: If existing resume, show "Replace" text
                        existingResume ? 'Replace Resume' : 'Confirm & Upload'
                    )}
                </Button>
            )}
            {/* Skip Option for Onboarding */}
            {mode === 'onboarding' && !file && (
                <div className="mt-4 flex justify-center">
                    <Button
                        onClick={handleContinue}
                        variant="ghost"
                        className="text-xs text-neutral-500 hover:text-white"
                    >
                        Skip for now
                    </Button>
                </div>
            )}
        </div>
    )
}

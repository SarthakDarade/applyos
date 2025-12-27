'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ExtractFromResumeButton({ resume, onComplete }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleExtract = async () => {
        if (!resume) {
            alert('No resume found to extract from.')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/extract-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume_id: resume.id,
                    resume_path: resume.file_path
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Extraction failed')
            }

            // Success
            if (onComplete) {
                onComplete(result)
            } else {
                // Default behavior if no callback
                alert('We have started analyzing your resume. This may take a moment.')
                router.refresh()
            }

        } catch (error) {
            console.error('Extraction Trigger Error:', error)
            alert(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleExtract}
            disabled={loading}
            variant="outline"
            className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20 gap-2 text-xs h-9 transition-all duration-300"
        >
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your resume...
                </>
            ) : (
                <>
                    <Sparkles className="h-4 w-4" /> Extract from Resume
                </>
            )}
        </Button>
    )
}

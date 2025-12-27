'use client'

import { useState } from 'react'
import { ExternalLink, CheckCircle2, X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function ApplyButton({ jobId, applyUrl, initialStatus }) {
    const [status, setStatus] = useState(initialStatus)
    const [loading, setLoading] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const supabase = createClient()

    const handleApply = async (e) => {
        e.preventDefault()

        // Case 1: Already Applied -> Cancel Application
        if (status?.toLowerCase() === 'applied') {
            // No confirm dialog if explicitly clicking the cancel state
            setLoading(true)
            setStatus(null) // Optimistic update

            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { error } = await supabase
                    .from('applications')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('job_id', jobId)

                if (error) {
                    console.error('Error removing application:', error)
                    setStatus('Applied') // Revert on error
                }
            } catch (err) {
                console.error('Remove tracking error:', err)
                setStatus('Applied')
            } finally {
                setLoading(false)
            }
            return
        }

        // Case 2: New Application -> Apply
        window.open(applyUrl, '_blank')

        setStatus('Applied')
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('applications')
                .insert({
                    user_id: user.id,
                    job_id: jobId,
                    status: 'Applied',
                    source: 'manual'
                })

            if (error) {
                if (error.code !== '23505') {
                    console.error('Error tracking application:', JSON.stringify(error, null, 2), error.message, error.details)
                }
            }
        } catch (err) {
            console.error('Apply tracking error:', err)
        } finally {
            setLoading(false)
        }
    }

    const normalizedStatus = status?.toLowerCase()

    if (['applied', 'viewed', 'interview', 'offer', 'rejected'].includes(normalizedStatus)) {
        return (
            <button
                onClick={handleApply}
                disabled={loading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex-1 w-full border ${isHovered
                        ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}
            >
                {isHovered ? (
                    <>
                        <Trash2 className="w-4 h-4" />
                        Remove
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="w-4 h-4" />
                        {status || 'Applied'}
                    </>
                )}
            </button>
        )
    }

    return (
        <button
            onClick={handleApply}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 px-6 py-3 rounded-lg font-semibold transition-colors flex-1 w-full"
        >
            Apply Now
            <ExternalLink className="w-4 h-4" />
        </button>
    )
}

'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function SaveJobButton({ jobId, initialSaved }) {
    const [saved, setSaved] = useState(initialSaved)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const toggleSave = async (e) => {
        e.preventDefault() // Prevent navigation if on card
        e.stopPropagation()
        if (loading) return

        setLoading(true)
        // Optimistic update
        const newSavedState = !saved
        setSaved(newSavedState)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return // Should probably redirect to login, but strictly sticking to quiet/non-pushy

            if (newSavedState) {
                const { error } = await supabase
                    .from('saved_jobs')
                    .insert({ user_id: user.id, job_id: jobId })
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('saved_jobs')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('job_id:uuid', jobId) // Ensure explicit typing or exact match
                if (error) throw error
            }
        } catch (error) {
            console.error('Error toggling save:', error)
            // Revert state on error
            setSaved(!newSavedState)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={toggleSave}
            className={`p-2 rounded-full transition-all duration-200 ${saved
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                }`}
            title={saved ? "Unsave job" : "Save job"}
        >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
    )
}

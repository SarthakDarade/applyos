'use client'

import { useState, useEffect } from 'react'
import { Settings, MapPin, Briefcase, Globe, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { updateOnboardingStep } from '@/app/actions/onboarding'

export function PreferencesForm({ mode = 'dashboard' }) {
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [fetching, setFetching] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    // Form State
    const [roles, setRoles] = useState('')
    const [locations, setLocations] = useState('')
    const [workStyles, setWorkStyles] = useState([]) // Array of strings

    // 1. Fetch existing preferences on mount
    useEffect(() => {
        async function fetchPreferences() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data, error } = await supabase
                    .from('job_preferences')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (data) {
                    setRoles(data.roles?.join(', ') || '')
                    setLocations(data.locations?.join(', ') || '')
                    setWorkStyles(data.work_styles || [])
                }
            } catch (error) {
                console.error('Error fetching preferences:', error)
            } finally {
                setFetching(false)
            }
        }
        fetchPreferences()
    }, [supabase])

    const handleStyleChange = (style) => {
        if (workStyles.includes(style)) {
            setWorkStyles(workStyles.filter(s => s !== style))
        } else {
            setWorkStyles([...workStyles, style])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSaved(false)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user')

            // Parse comma-separated strings into arrays
            const rolesArray = roles.split(',').map(s => s.trim()).filter(Boolean)
            const locationsArray = locations.split(',').map(s => s.trim()).filter(Boolean)

            const { error } = await supabase
                .from('job_preferences')
                .upsert({
                    user_id: user.id,
                    roles: rolesArray,
                    locations: locationsArray,
                    work_styles: workStyles,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error

            setSaved(true)

            if (mode === 'onboarding') {
                await updateOnboardingStep(3)
                router.push('/dashboard')
            } else {
                setTimeout(() => setSaved(false), 3000)
            }

        } catch (error) {
            console.error('Error saving preferences:', error.message || error)
            alert(`Failed to save preferences: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="glass-panel p-6 rounded-xl h-full flex items-center justify-center">
                <span className="text-xs text-neutral-500 animate-pulse">Loading preferences...</span>
            </div>
        )
    }

    return (
        <div className="glass-panel p-6 rounded-xl h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-neutral-500" />
                    Job Preferences
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3" /> Target Roles (comma separated)
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Frontend Engineer, React Developer"
                        className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:bg-black/40 outline-none focus:ring-1 focus:ring-white/20"
                        required
                        value={roles}
                        onChange={(e) => setRoles(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> Locations
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. San Francisco, New York, Remote"
                        className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:bg-black/40 outline-none focus:ring-1 focus:ring-white/20"
                        required
                        value={locations}
                        onChange={(e) => setLocations(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                        <Globe className="h-3 w-3" /> Work Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Remote', 'Hybrid', 'On-site'].map((type) => {
                            const isSelected = workStyles.includes(type)
                            return (
                                <div
                                    key={type}
                                    onClick={() => handleStyleChange(type)}
                                    className={`cursor-pointer text-center py-2 px-1 rounded-md border text-xs transition-all duration-200
                        ${isSelected
                                            ? 'bg-white/10 text-white border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                                            : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/5'
                                        }
                    `}
                                >
                                    {type}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                    <Button
                        type="submit"
                        variant="secondary"
                        disabled={loading}
                        className="w-full text-xs h-9"
                    >
                        {mode === 'onboarding'
                            ? (loading ? 'Finishing...' : 'Complete Setup')
                            : (loading ? 'Saving...' : 'Save Preferences')}
                    </Button>

                    <div className={`flex items-center justify-center gap-2 text-xs text-emerald-400 transition-all duration-500 overflow-hidden ${saved ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0'}`}>
                        <div className="h-4 w-4 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/20">
                            <Check className="h-2.5 w-2.5" />
                        </div>
                        Preferences saved successfully
                    </div>
                </div>
            </form>
        </div>
    )
}

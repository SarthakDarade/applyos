'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { saveEnhancedProfile } from '@/app/actions/onboarding'
import { Sparkles, User, MapPin, Briefcase, Clock, Code, FileText, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ProfileEnhancer({ profile, resume }) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)   // Saving

    // Local state for the form so we can populate it
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        location: profile?.location || '',
        current_role: (Array.isArray(profile?.current_role) ? profile.current_role[0] : profile?.current_role) || '',
        experience_years: profile?.experience_years || '',
        skills: profile?.skills?.join(', ') || '',
        bio: profile?.bio || ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const data = new FormData(e.target)
            await saveEnhancedProfile(data)
            router.push('/onboarding/step-3')
        } catch (err) {
            alert('Save failed: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="glass-panel p-8 rounded-xl max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Section */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Review Profile</h2>
                    <p className="text-sm text-neutral-400 mt-1">
                        Confirm your details to help our agents apply correctly.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                            <User className="h-3 w-3" /> Full Name
                        </label>
                        <input
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:bg-black/40 outline-none focus:ring-1 focus:ring-white/20 transition-all duration-500"
                            required
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" /> Location
                        </label>
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:bg-black/40 outline-none focus:ring-1 focus:ring-white/20 transition-all duration-500"
                            placeholder="e.g. London, UK"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Role */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                            <Briefcase className="h-3 w-3" /> Current Role
                        </label>
                        <input
                            name="current_role"
                            value={formData.current_role}
                            onChange={handleChange}
                            className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:bg-black/40 outline-none focus:ring-1 focus:ring-white/20 transition-all duration-500"
                            placeholder="e.g. Product Designer"
                        />
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> Years Experience
                        </label>
                        <input
                            name="experience_years"
                            type="number"
                            value={formData.experience_years}
                            onChange={handleChange}
                            className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:bg-black/40 outline-none focus:ring-1 focus:ring-white/20 transition-all duration-500"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                        <Code className="h-3 w-3" /> Skills (comma separated)
                    </label>
                    <textarea
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:bg-black/40 outline-none focus:ring-1 focus:ring-white/20 min-h-[80px] transition-all duration-500"
                        placeholder="React, Next.js, TypeScript, Tailwind..."
                    />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                        <FileText className="h-3 w-3" /> Brief Bio
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:bg-black/40 outline-none focus:ring-1 focus:ring-white/20 min-h-[100px] transition-all duration-500"
                        placeholder="Tell us about your professional background..."
                    />
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={saving}
                        className="min-w-[140px]"
                    >
                        {saving ? 'Saving...' : 'Save & Continue'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

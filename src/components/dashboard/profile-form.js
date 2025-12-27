'use client'

import { useState } from 'react'
import { updateProfessionalProfile } from '@/app/actions/professional-profile'
import { Button } from '@/components/ui/button'
import { User, MapPin, Mail, Phone, Globe, Linkedin, FileText, Layout, Award, BookOpen, Briefcase, Zap, Wand2, GraduationCap, Code } from 'lucide-react'
import { ArrayInput } from './profile/array-input'
import { ExperienceList } from './profile/experience-list'
import { EducationList } from './profile/education-list'
import { ProjectList } from './profile/project-list'
import { CertificationList } from './profile/certification-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ProfileForm({ profile, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    // Initialize state from profile prop, with safe defaults
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        headline: profile?.headline || '',
        location: profile?.location || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        website: profile?.website || '',
        linkedin: profile?.linkedin || '',
        professional_summary: profile?.professional_summary || '',
        years_experience: profile?.years_experience || 0,
        skills: profile?.skills || [],
        interests: profile?.interests || [],
        languages: profile?.languages || [],
        achievements: profile?.achievements || [],
        work_experience: profile?.work_experience || [],
        education: profile?.education || [],
        projects: profile?.projects || [],
        certifications: profile?.certifications || []
    })

    const [optimizingKey, setOptimizingKey] = useState(null)
    const [lastOptimizeTime, setLastOptimizeTime] = useState(0)

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const [feedback, setFeedback] = useState(null)

    const handleOptimize = async (section_key, section_content) => {
        if (!section_content?.trim()) return

        if (section_content.length < 50) {
            setFeedback({ key: section_key, message: 'Min 50 chars required', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
            return
        }

        const now = Date.now()
        if (now - lastOptimizeTime < 5000) {
            setFeedback({ key: section_key, message: 'Please wait...', type: 'warning' })
            setTimeout(() => setFeedback(null), 3000)
            return
        }

        setOptimizingKey(section_key)
        setLastOptimizeTime(now)

        try {
            const response = await fetch('/api/resume/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_key, section_content })
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || `Optimization failed with status ${response.status}`)
            }

            const result = await response.json()
            if (result.enhanced_content) {
                setFormData(prev => ({ ...prev, professional_summary: result.enhanced_content }))
            }
        } catch (e) {
            console.error("Optimization request failed", e)
            setFeedback({ key: section_key, message: 'Failed', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
        } finally {
            setOptimizingKey(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const result = await updateProfessionalProfile(profile?.user_id, formData)

            if (result.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully.' })
                if (onSuccess) onSuccess();
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Actions */}
            <div className="flex items-center justify-between sticky top-4 z-50 bg-[#0A0A0A]/80 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-2xl">
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : message.type === 'error' ? 'bg-red-500' : 'bg-neutral-500'}`} />
                    <span className="text-xs font-medium text-neutral-400">
                        {message.text || (loading ? 'Saving...' : 'Ready to save')}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/5"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="basics" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto no-scrollbar bg-transparent border-b border-white/5 h-auto p-0 gap-6 rounded-none mb-8">
                    <TabsTrigger value="basics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-0 py-3 text-neutral-400 data-[state=active]:text-white data-[state=active]:shadow-none transition-colors hover:text-white">
                        <User className="w-4 h-4 mr-2" /> Basics
                    </TabsTrigger>
                    <TabsTrigger value="experience" className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-0 py-3 text-neutral-400 data-[state=active]:text-white data-[state=active]:shadow-none transition-colors hover:text-white">
                        <Briefcase className="w-4 h-4 mr-2" /> Experience
                    </TabsTrigger>
                    <TabsTrigger value="education" className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-0 py-3 text-neutral-400 data-[state=active]:text-white data-[state=active]:shadow-none transition-colors hover:text-white">
                        <GraduationCap className="w-4 h-4 mr-2" /> Education
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-0 py-3 text-neutral-400 data-[state=active]:text-white data-[state=active]:shadow-none transition-colors hover:text-white">
                        <Zap className="w-4 h-4 mr-2" /> Skills & More
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="basics" className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                    <div className="glass-panel p-6 rounded-xl space-y-6">
                        <div className="flex items-center gap-2 text-white font-medium pb-4 border-b border-white/5">
                            <User className="h-4 w-4 text-blue-400" /> Basic Information
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-neutral-400">Full Name</label>
                                <input
                                    value={formData.full_name}
                                    onChange={e => handleChange('full_name', e.target.value)}
                                    className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-neutral-400">Headline</label>
                                <input
                                    value={formData.headline}
                                    onChange={e => handleChange('headline', e.target.value)}
                                    className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                    placeholder="Software Engineer @ Google"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-neutral-400">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                                    <input
                                        value={formData.email}
                                        onChange={e => handleChange('email', e.target.value)}
                                        className="glass-input w-full rounded-lg pl-9 pr-3 py-2 text-sm text-white bg-black/20 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                        placeholder="jane@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-neutral-400">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                                    <input
                                        value={formData.phone}
                                        onChange={e => handleChange('phone', e.target.value)}
                                        className="glass-input w-full rounded-lg pl-9 pr-3 py-2 text-sm text-white bg-black/20 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-neutral-400">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                                    <input
                                        value={formData.location}
                                        onChange={e => handleChange('location', e.target.value)}
                                        className="glass-input w-full rounded-lg pl-9 pr-3 py-2 text-sm text-white bg-black/20 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                        placeholder="San Francisco, CA"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-neutral-400">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                                    <input
                                        value={formData.website}
                                        onChange={e => handleChange('website', e.target.value)}
                                        className="glass-input w-full rounded-lg pl-9 pr-3 py-2 text-sm text-white bg-black/20 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                        placeholder="https://janedoe.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs text-neutral-400">LinkedIn</label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                                    <input
                                        value={formData.linkedin}
                                        onChange={e => handleChange('linkedin', e.target.value)}
                                        className="glass-input w-full rounded-lg pl-9 pr-3 py-2 text-sm text-white bg-black/20 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                        placeholder="https://linkedin.com/in/janedoe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-xs text-neutral-400 flex items-center justify-between">
                                <span className="flex items-center gap-2"><FileText className="h-3 w-3" /> Professional Summary</span>
                                <button
                                    type="button"
                                    onClick={() => handleOptimize('summary', formData.professional_summary)}
                                    disabled={optimizingKey === 'summary'}
                                    className={`text-xs flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-wait ${feedback?.key === 'summary' && feedback.type === 'error' ? 'text-red-400' : 'text-purple-400 hover:text-purple-300'}`}
                                >
                                    <Wand2 className={`w-3 h-3 ${optimizingKey === 'summary' ? 'animate-spin' : ''}`} />
                                    {optimizingKey === 'summary' ? 'Optimizing...' : (feedback?.key === 'summary' ? feedback.message : 'Optimize with AI')}
                                </button>
                            </label>
                            <textarea
                                value={formData.professional_summary}
                                onChange={e => handleChange('professional_summary', e.target.value)}
                                className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:ring-1 focus:ring-blue-500/50 outline-none min-h-[120px] leading-relaxed transition-all"
                                placeholder="Brief summary of your professional background and goals..."
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="experience" className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="glass-panel p-6 rounded-xl space-y-8">
                        <div className="flex items-center gap-2 text-white font-medium pb-4 border-b border-white/5">
                            <Briefcase className="h-4 w-4 text-emerald-400" /> Work Experience
                        </div>
                        <ExperienceList
                            items={formData.work_experience}
                            onChange={val => handleChange('work_experience', val)}
                        />
                    </div>

                    <div className="glass-panel p-6 rounded-xl space-y-8">
                        <div className="flex items-center gap-2 text-white font-medium pb-4 border-b border-white/5">
                            <Code className="h-4 w-4 text-pink-400" /> Projects
                        </div>
                        <ProjectList
                            items={formData.projects}
                            onChange={val => handleChange('projects', val)}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="education" className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="glass-panel p-6 rounded-xl space-y-8">
                        <div className="flex items-center gap-2 text-white font-medium pb-4 border-b border-white/5">
                            <BookOpen className="h-4 w-4 text-purple-400" /> Education
                        </div>
                        <EducationList
                            items={formData.education}
                            onChange={val => handleChange('education', val)}
                        />
                    </div>
                    <div className="glass-panel p-6 rounded-xl space-y-8">
                        <div className="flex items-center gap-2 text-white font-medium pb-4 border-b border-white/5">
                            <Award className="h-4 w-4 text-orange-400" /> Certifications
                        </div>
                        <CertificationList
                            items={formData.certifications}
                            onChange={val => handleChange('certifications', val)}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="glass-panel p-6 rounded-xl space-y-6">
                        <div className="flex items-center gap-2 text-white font-medium pb-4 border-b border-white/5">
                            <Zap className="h-4 w-4 text-yellow-400" /> Skills & More
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-neutral-400">Years of Experience</label>
                            <input
                                type="number"
                                value={formData.years_experience}
                                onChange={e => handleChange('years_experience', parseInt(e.target.value) || 0)}
                                className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:ring-1 focus:ring-yellow-500/50 outline-none transition-all"
                            />
                        </div>

                        <ArrayInput
                            label="Skills"
                            items={formData.skills}
                            onChange={val => handleChange('skills', val)}
                            placeholder="Add skill..."
                        />

                        <ArrayInput
                            label="Languages"
                            items={formData.languages}
                            onChange={val => handleChange('languages', val)}
                            placeholder="Add language..."
                        />

                        <ArrayInput
                            label="Interests"
                            items={formData.interests}
                            onChange={val => handleChange('interests', val)}
                            placeholder="Add interest..."
                        />

                        <ArrayInput
                            label="Achievements"
                            items={formData.achievements}
                            onChange={val => handleChange('achievements', val)}
                            placeholder="Add achievement..."
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </form>
    )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function JobFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        location: searchParams.get('location') || '',
        type: searchParams.get('type') || '',
        level: searchParams.get('level') || ''
    })

    // Debounce search update
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams()
            if (filters.search) params.set('search', filters.search)
            if (filters.location) params.set('location', filters.location)
            if (filters.type) params.set('type', filters.type)
            if (filters.level) params.set('level', filters.level)

            router.push(`/jobs?${params.toString()}`)
        }, 300)

        return () => clearTimeout(timer)
    }, [filters, router])

    const jobTypes = ['Full-time', 'Contract', 'Internship', 'Freelance']
    const experienceLevels = ['Junior', 'Mid-Level', 'Senior', 'Lead']

    const clearFilters = () => {
        setFilters({ search: '', location: '', type: '', level: '' })
        router.push('/jobs')
    }

    const hasFilters = Object.values(filters).some(Boolean)

    return (
        <div className="space-y-6">
            <div className="glass-panel p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-neural-400" />
                    <h3 className="text-sm font-medium text-white uppercase tracking-wide">Filters</h3>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Location</label>
                    <input
                        type="text"
                        placeholder="e.g. Remote, San Francisco"
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/20"
                    />
                </div>

                {/* Job Type */}
                <div>
                    <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Job Type</label>
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-neutral-300 focus:outline-none focus:border-white/20 [&>option]:bg-neutral-900"
                    >
                        <option value="">Any Type</option>
                        {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Experience Level */}
                <div>
                    <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Experience</label>
                    <select
                        value={filters.level}
                        onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-neutral-300 focus:outline-none focus:border-white/20 [&>option]:bg-neutral-900"
                    >
                        <option value="">Any Level</option>
                        {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                {/* Clear Button */}
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    )
}

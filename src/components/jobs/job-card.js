import Link from 'next/link'
import { MapPin, Clock, Briefcase } from 'lucide-react'
import { SaveJobButton } from './save-button'

export function JobCard({ job, isSaved }) {
    // Calculate relative time (e.g., "2 days ago")
    const daysAgo = Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24))
    const timeString = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`

    return (
        <Link
            href={`/jobs/${job.id}`}
            className="group block glass-card p-5 rounded-xl transition-all duration-200 hover:border-white/20 hover:bg-white/5 relative"
        >
            <div className="absolute top-5 right-5 z-10">
                <SaveJobButton jobId={job.id} initialSaved={isSaved} />
            </div>

            <div className="flex justify-between items-start mb-4 pr-10">
                <div className="flex items-center gap-4">
                    {job.logo_url ? (
                        <div className="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center shrink-0 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={job.logo_url} alt={job.company} className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <Briefcase className="w-6 h-6 text-neutral-400" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                            {job.title}
                        </h3>
                        <p className="text-sm text-neutral-400 font-medium">{job.company}</p>
                    </div>
                </div>
                {daysAgo < 3 && (
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase tracking-wide">
                        New
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-neutral-500 mb-4">
                <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{job.job_type}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeString}</span>
                </div>
                {job.experience_level && (
                    <div className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-neutral-400">
                        {job.experience_level}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {job.skills_required?.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-1 rounded bg-white/5 text-[10px] text-neutral-400 border border-white/5">
                        {skill}
                    </span>
                ))}
                {job.skills_required?.length > 3 && (
                    <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-neutral-500 border border-white/5">
                        +{job.skills_required.length - 3}
                    </span>
                )}
            </div>
        </Link>
    )
}


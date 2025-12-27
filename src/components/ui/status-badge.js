import { cn } from '@/lib/utils'

export function StatusBadge({ status, label, className }) {
    const variants = {
        neutral: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
        processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    }

    // Map simplified status keys to variants
    const statusMap = {
        'active': 'success',
        'paused': 'neutral',
        'error': 'error',
        'processing': 'processing',
        'pending': 'warning',
        'uploaded': 'success'
    }

    const variantStyle = variants[statusMap[status] || 'neutral']

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyle} ${className}`}>
            <span className={`h-1.5 w-1.5 rounded-full bg-current ${status === 'processing' ? 'animate-pulse' : ''}`} />
            {label}
        </span>
    )
}

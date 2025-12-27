import { AlertCircle } from 'lucide-react'

export function EmptyState({ title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-neutral-500" />
            </div>
            <h3 className="text-white font-medium mb-1">{title}</h3>
            <p className="text-sm text-neutral-400 max-w-sm mb-6">{description}</p>
            {action}
        </div>
    )
}

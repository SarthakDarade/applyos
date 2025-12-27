import { Clock } from 'lucide-react'

export function ActivityFeed({ activities }) {
    // activities: [{ action, created_at }]

    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8">
                <Clock className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No recent activity</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {activities.map((item, i) => {
                const date = new Date(item.created_at)
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })

                return (
                    <div key={item.id || i} className="group relative pl-6 pb-2 border-l border-white/10 last:border-0 last:pb-0 transition-colors">
                        <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border border-black bg-neutral-600 shadow-sm group-hover:bg-blue-400 group-hover:scale-125 transition-all duration-300" />
                        <div className="group-hover:translate-x-1 transition-transform duration-300">
                            <p className="text-sm text-neutral-300 leading-none mb-1.5 group-hover:text-white transition-colors">{item.action}</p>
                            {item.description && (
                                <p className="text-xs text-neutral-500 mb-1 group-hover:text-neutral-400">{item.description}</p>
                            )}
                            <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider group-hover:text-blue-500/70">{dateStr} • {timeStr}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

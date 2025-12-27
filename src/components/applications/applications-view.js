'use client';

import { useState } from 'react';
import {
    LayoutGrid,
    List,
    Search,
    Filter,
    Plus,
    Building2,
    MapPin,
    Calendar,
    ExternalLink,
    MoreHorizontal,
    Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AddApplicationForm } from '@/components/applications/add-application-form';
import { ApplicationActions } from '@/components/applications/application-actions';

// Status Columns Definition
const STATUS_COLUMNS = [
    { id: 'applied', label: 'Applied', color: 'bg-blue-500', text: 'text-blue-400' },
    { id: 'interviewing', label: 'Interviewing', color: 'bg-orange-500', text: 'text-orange-400' },
    { id: 'offer', label: 'Offer', color: 'bg-emerald-500', text: 'text-emerald-400' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-500', text: 'text-red-400' },
];

export function ApplicationsView({ initialApplications }) {
    const [viewMode, setViewMode] = useState('board'); // 'list' | 'board'
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter Logic
    const filteredApps = initialApplications.filter(app => {
        const matchesSearch =
            app.jobs.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.jobs.company?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || app.status?.toLowerCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: initialApplications.length,
        active: initialApplications.filter(a => ['applied', 'interviewing'].includes(a.status?.toLowerCase())).length,
        offers: initialApplications.filter(a => a.status?.toLowerCase() === 'offer').length
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Applications</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400">
                        <span>{stats.total} Total</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-700" />
                        <span className="text-blue-400">{stats.active} Active</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-700" />
                        <span className="text-emerald-400">{stats.offers} Offers</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors" />
                        <input
                            placeholder="Search applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-neutral-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:bg-neutral-900 focus:border-white/20 outline-none transition-all w-48 focus:w-64"
                        />
                    </div>

                    {/* Add Button */}
                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="bg-white text-black hover:bg-neutral-200 gap-2 h-10 px-4"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Track New</span>
                    </Button>
                </div>
            </div>

            {/* View Toggles & Filters */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('board')}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            viewMode === 'board' ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-white"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            viewMode === 'list' ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-white"
                        )}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                {/* Status Filter Tabs (Horizontal) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                            statusFilter === 'all'
                                ? "bg-white text-black border-white"
                                : "bg-transparent text-neutral-400 border-transparent hover:bg-white/5 hover:text-white"
                        )}
                    >
                        All
                    </button>
                    {STATUS_COLUMNS.map(status => (
                        <button
                            key={status.id}
                            onClick={() => setStatusFilter(status.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap flex items-center gap-2",
                                statusFilter === status.id
                                    ? `bg-${status.color.split('-')[1]}-500/10 ${status.text} border-${status.color.split('-')[1]}-500/20`
                                    : "bg-transparent text-neutral-400 border-transparent hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <span className={cn("w-1.5 h-1.5 rounded-full", status.color)} />
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'board' ? (
                <BoardView applications={filteredApps} />
            ) : (
                <ListView applications={filteredApps} />
            )}

            {/* Modals */}
            {showAddForm && (
                <AddApplicationForm onCancel={() => setShowAddForm(false)} />
            )}
        </div>
    );
}

function BoardView({ applications }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map(col => {
                const colApps = applications.filter(a => a.status?.toLowerCase() === col.id);
                return (
                    <div key={col.id} className="min-w-[280px] space-y-4">
                        {/* Column Header */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full", col.color)} />
                                <span className="text-sm font-medium text-neutral-300">{col.label}</span>
                                <span className="text-xs text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">{colApps.length}</span>
                            </div>
                        </div>

                        {/* Cards Stack */}
                        <div className="space-y-3">
                            {colApps.length === 0 ? (
                                <div className="h-24 border border-dashed border-white/5 rounded-xl flex items-center justify-center text-xs text-neutral-600">
                                    No applications
                                </div>
                            ) : (
                                colApps.map(app => (
                                    <ApplicationCard key={app.id} app={app} />
                                ))
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}

function ListView({ applications }) {
    if (applications.length === 0) {
        return (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-xl">
                <p className="text-neutral-500">No applications found matching your filters.</p>
            </div>
        );
    }
    return (
        <div className="space-y-3">
            {applications.map(app => (
                <ApplicationCard key={app.id} app={app} variant="list" />
            ))}
        </div>
    );
}

function ApplicationCard({ app, variant = 'board' }) {
    const isList = variant === 'list';

    return (
        <div className={cn(
            "glass-panel border-white/5 hover:border-white/10 transition-all duration-300 group relative",
            isList ? "p-4 flex items-center gap-6" : "p-4 rounded-xl flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg"
        )}>
            {/* Logo & Header */}
            <div className={cn("flex items-start gap-4", isList ? "flex-1" : "justify-between w-full")}>
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                        {app.jobs.logo_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={app.jobs.logo_url} alt={app.jobs.company} className="w-full h-full object-contain" />
                        ) : (
                            <Briefcase className="w-5 h-5 text-neutral-600" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                            {app.jobs.title}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            {app.jobs.company}
                        </p>
                    </div>
                </div>

                {/* Actions (Top Right in Board) */}
                {!isList && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {app.jobs.apply_url && (
                            <a href={app.jobs.apply_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white/10 rounded-md text-neutral-500 hover:text-white">
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                        <ApplicationActions app={app} />
                    </div>
                )}
            </div>

            {/* Details (List View Spreading) */}
            {isList && (
                <>
                    <div className="w-48 text-sm text-neutral-400 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {app.jobs.location || "Remote"}
                    </div>
                    <div className="w-32 text-sm text-neutral-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                </>
            )}

            {/* Footer / Status (Board View) */}
            {!isList && (
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    {/* Status badge hidden in board view if in columns, but helpful if columns are "All" */}
                </div>
            )}

            {/* Actions (List View End) */}
            {isList && (
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-medium border capitalize",
                        app.status?.toLowerCase() === 'applied' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            app.status?.toLowerCase() === 'interviewing' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                app.status?.toLowerCase() === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    )}>
                        {app.status}
                    </span>
                    <ApplicationActions app={app} />
                </div>
            )}
        </div>
    );
}

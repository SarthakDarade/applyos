'use client';

import { FileText, Plus, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function RecentResumesWidget({ resumes }) {
    // resumes: array of resume objects
    const hasResumes = resumes && resumes.length > 0;
    const items = hasResumes ? resumes.slice(0, 3) : [];

    return (
        <div className="glass-panel p-6 rounded-xl h-full flex flex-col bg-gradient-to-br from-pink-500/5 to-transparent relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                        <FileText className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-medium text-white uppercase tracking-wide">
                        Recent Resumes
                    </h3>
                </div>
                {hasResumes && (
                    <Link href="/resume" className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 hover:bg-white/5 rounded-md">
                        View All <ChevronRight className="w-3 h-3" />
                    </Link>
                )}
            </div>

            {/* List */}
            <div className="space-y-2 flex-1 relative z-10">
                {items.length > 0 ? (
                    items.map((resume, i) => (
                        <motion.div
                            key={resume.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link
                                href={`/resume/${resume.id}`}
                                className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                                        ${i === 0 ? 'bg-pink-500 text-white' : 'bg-white/5 text-neutral-400 group-hover:text-white'}
                                   `}>
                                        {i === 0 ? 'CV' : (i + 1)}
                                    </div>

                                    <div className="min-w-0">
                                        <h4 className="text-sm font-medium text-neutral-300 group-hover:text-white truncate transition-colors pr-2">
                                            {resume.title || 'Untitled Resume'}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 group-hover:text-neutral-400 transition-colors">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(resume.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {i === 0 && (
                                                <span className="text-pink-400 font-medium">• Latest</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-neutral-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-5px] group-hover:translate-x-0 duration-200">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </Link>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-neutral-500 border border-dashed border-white/10 rounded-xl bg-white/5">
                        <FileText className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-xs">No resumes created yet</p>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <Link
                    href="/resume/new"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 hover:text-pink-300 text-xs font-semibold transition-all group"
                >
                    <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    Create New Resume
                </Link>
            </div>
        </div>
    );
}

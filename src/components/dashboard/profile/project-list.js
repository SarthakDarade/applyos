'use client'

import { useState } from 'react'
import { Plus, X, FolderGit2, Link as LinkIcon, Wand2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ProjectList({ items = [], onChange }) {
    const [isAdding, setIsAdding] = useState(false)
    const [newItem, setNewItem] = useState({
        name: '',
        role: '',
        url: '',
        description: ''
    })
    const [editingIndex, setEditingIndex] = useState(null)
    const [editingItem, setEditingItem] = useState(null)
    const [optimizing, setOptimizing] = useState(false)
    const [feedback, setFeedback] = useState('')

    const handleOptimize = async (isEditing = false) => {
        const currentDescription = isEditing ? editingItem.description : newItem.description
        if (!currentDescription?.trim()) return

        if (currentDescription.length < 50) {
            setFeedback('Min 50 chars required')
            setTimeout(() => setFeedback(''), 3000)
            return
        }

        setOptimizing(true)
        setFeedback('')
        try {
            const response = await fetch('/api/resume/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section_key: 'projects[0].description',
                    section_content: currentDescription
                })
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || `Optimization failed`)
            }

            const result = await response.json()
            if (result.enhanced_content) {
                if (isEditing) {
                    setEditingItem(prev => ({ ...prev, description: result.enhanced_content }))
                } else {
                    setNewItem(prev => ({ ...prev, description: result.enhanced_content }))
                }
            }
        } catch (e) {
            console.error("Optimization failed", e)
            setFeedback('Failed')
            setTimeout(() => setFeedback(''), 3000)
        } finally {
            setOptimizing(false)
        }
    }

    const handleAdd = () => {
        if (!newItem.name) return

        onChange([...items, newItem])
        setNewItem({
            name: '',
            role: '',
            url: '',
            description: ''
        })
        setIsAdding(false)
    }

    const handleCancelEdit = () => {
        setEditingIndex(null)
        setEditingItem(null)
    }

    const handleSaveEdit = () => {
        if (!editingItem.name) return
        const newItems = [...items]
        newItems[editingIndex] = editingItem
        onChange(newItems)
        setEditingIndex(null)
        setEditingItem(null)
    }

    const startEdit = (index) => {
        setEditingIndex(index)
        setEditingItem({ ...items[index] })
        setIsAdding(false)
    }

    const handleRemove = (index) => {
        onChange(items.filter((_, i) => i !== index))
        if (editingIndex === index) handleCancelEdit()
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-400 font-mono uppercase">Projects</label>
                {!isAdding && (
                    <Button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        variant="ghost"
                        className="h-8 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                    >
                        <Plus className="h-3 w-3 mr-1.5" /> Add Project
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="glass-panel p-4 rounded-lg border border-white/5 relative group">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                type="button"
                                onClick={() => startEdit(index)}
                                className="text-neutral-500 hover:text-blue-400"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="text-neutral-500 hover:text-red-400"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                                <FolderGit2 className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                    {item.name}
                                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><LinkIcon className="h-3 w-3 text-neutral-500 hover:text-blue-400" /></a>}
                                </h4>
                                <p className="text-xs text-neutral-400">{item.role}</p>
                                {item.description && (
                                    <p className="mt-2 text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isAdding && (
                <div className="glass-panel p-4 rounded-lg border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase text-neutral-500">Project Name</label>
                            <input
                                value={newItem.name}
                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-emerald-500/50"
                                placeholder="Portfolio Website"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase text-neutral-500">Your Role</label>
                            <input
                                value={newItem.role}
                                onChange={e => setNewItem({ ...newItem, role: e.target.value })}
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-emerald-500/50"
                                placeholder="Full Stack Developer"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-neutral-500">Project URL</label>
                        <input
                            value={newItem.url}
                            onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                            className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-emerald-500/50"
                            placeholder="https://github.com/..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase text-neutral-500">Description</label>
                            <button
                                type="button"
                                onClick={() => handleOptimize(false)}
                                disabled={optimizing}
                                className={`text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-wait ${feedback && feedback.includes('Min') ? 'text-red-400' : 'text-purple-400 hover:text-purple-300'}`}
                            >
                                <Wand2 className={`w-3 h-3 ${optimizing ? 'animate-spin' : ''}`} />
                                {optimizing ? 'Optimizing...' : (feedback || 'Optimize with AI')}
                            </button>
                        </div>
                        <textarea
                            value={newItem.description}
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-emerald-500/50 min-h-[80px]"
                            placeholder="What did you build and how?"
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            variant="ghost"
                            className="h-8 text-xs text-neutral-400 hover:text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAdd}
                            className="h-8 text-xs bg-white text-black hover:bg-neutral-200 border-none"
                        >
                            Add Project
                        </Button>
                    </div>
                </div>
            )}

            {/* Editing Form Modal/Inline */}
            {editingIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-4 w-full max-w-lg bg-[#0A0A0A] shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-semibold text-white">Edit Project</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase text-neutral-500">Project Name</label>
                                <input
                                    value={editingItem.name}
                                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                    className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-emerald-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase text-neutral-500">Your Role</label>
                                <input
                                    value={editingItem.role}
                                    onChange={e => setEditingItem({ ...editingItem, role: e.target.value })}
                                    className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-emerald-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase text-neutral-500">Project URL</label>
                            <input
                                value={editingItem.url}
                                onChange={e => setEditingItem({ ...editingItem, url: e.target.value })}
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-emerald-500/50"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] uppercase text-neutral-500">Description</label>
                                <button
                                    type="button"
                                    onClick={() => handleOptimize(true)}
                                    disabled={optimizing}
                                    className={`text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-wait ${feedback && feedback.includes('Min') ? 'text-red-400' : 'text-purple-400 hover:text-purple-300'}`}
                                >
                                    <Wand2 className={`w-3 h-3 ${optimizing ? 'animate-spin' : ''}`} />
                                    {optimizing ? 'Optimizing...' : (feedback || 'Optimize with AI')}
                                </button>
                            </div>
                            <textarea
                                value={editingItem.description}
                                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-emerald-500/50 min-h-[120px]"
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <Button
                                type="button"
                                onClick={handleCancelEdit}
                                variant="ghost"
                                className="h-8 text-xs text-neutral-400 hover:text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveEdit}
                                className="h-8 text-xs bg-white text-black hover:bg-neutral-200 border-none"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

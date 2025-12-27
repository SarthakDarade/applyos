'use client'

import { useState } from 'react'
import { Plus, X, GraduationCap, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EducationList({ items = [], onChange }) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingIndex, setEditingIndex] = useState(-1)
    const [newItem, setNewItem] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: ''
    })

    const resetForm = () => {
        setNewItem({
            institution: '',
            degree: '',
            fieldOfStudy: '',
            startYear: '',
            endYear: ''
        })
        setIsAdding(false)
        setEditingIndex(-1)
    }

    const handleSave = () => {
        if (!newItem.institution || !newItem.degree) return

        if (editingIndex >= 0) {
            // Edit existing
            const updated = [...items]
            updated[editingIndex] = newItem
            onChange(updated)
        } else {
            // Add new
            onChange([...items, newItem])
        }
        resetForm()
    }

    const handleEdit = (index) => {
        setNewItem(items[index])
        setEditingIndex(index)
        setIsAdding(true)
    }

    const handleRemove = (index) => {
        onChange(items.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-400 font-mono uppercase">Education</label>
                {!isAdding && (
                    <Button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        variant="ghost"
                        className="h-8 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                    >
                        <Plus className="h-3 w-3 mr-1.5" /> Add Education
                    </Button>
                )}
            </div>

            {!isAdding && (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="glass-panel p-4 rounded-lg border border-white/5 relative group hover:border-white/10 transition-all">
                            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(index)}
                                    className="text-neutral-500 hover:text-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
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
                                <div className="p-2 rounded bg-purple-500/10 text-purple-400">
                                    <GraduationCap className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-white">{item.institution}</h4>
                                    <p className="text-xs text-neutral-400">{item.degree} • {item.fieldOfStudy}</p>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500 font-mono">
                                        <Calendar className="h-3 w-3" />
                                        {item.startYear} — {item.endYear || 'Present'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAdding && (
                <div className="glass-panel p-4 rounded-lg border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase text-purple-400">{editingIndex >= 0 ? 'Edit Education' : 'Add Education'}</span>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-neutral-500">Institution</label>
                        <input
                            value={newItem.institution}
                            onChange={e => setNewItem({ ...newItem, institution: e.target.value })}
                            className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-purple-500/50"
                            placeholder="University of California, Berkeley"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase text-neutral-500">Degree</label>
                            <input
                                value={newItem.degree}
                                onChange={e => setNewItem({ ...newItem, degree: e.target.value })}
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-purple-500/50"
                                placeholder="B.S."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase text-neutral-500">Field of Study</label>
                            <input
                                value={newItem.fieldOfStudy}
                                onChange={e => setNewItem({ ...newItem, fieldOfStudy: e.target.value })}
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-purple-500/50"
                                placeholder="Computer Science"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase text-neutral-500">Start Year</label>
                            <input
                                type="number"
                                value={newItem.startYear}
                                onChange={e => setNewItem({ ...newItem, startYear: e.target.value })}
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-purple-500/50"
                                placeholder="2018"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase text-neutral-500">End Year</label>
                            <input
                                type="number"
                                value={newItem.endYear}
                                onChange={e => setNewItem({ ...newItem, endYear: e.target.value })}
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-purple-500/50"
                                placeholder="2022"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            onClick={resetForm}
                            variant="ghost"
                            className="h-8 text-xs text-neutral-400 hover:text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            className="h-8 text-xs bg-white text-black hover:bg-neutral-200 border-none"
                        >
                            {editingIndex >= 0 ? 'Save Changes' : 'Add Education'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

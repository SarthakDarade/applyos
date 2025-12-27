'use client'

import { useState } from 'react'
import { Plus, X, Briefcase, Calendar as CalendarIcon, Wand2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function ExperienceList({ items = [], onChange }) {
    const [isAdding, setIsAdding] = useState(false)
    const [newItem, setNewItem] = useState({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
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
                    section_key: 'experience[0].description',
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
        if (!newItem.company || !newItem.position) return

        onChange([...items, newItem])
        setNewItem({
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        })
        setIsAdding(false)
    }

    const handleCancelEdit = () => {
        setEditingIndex(null)
        setEditingItem(null)
    }

    const handleSaveEdit = () => {
        if (!editingItem.company || !editingItem.position) return
        const newItems = [...items]
        newItems[editingIndex] = editingItem
        onChange(newItems)
        setEditingIndex(null)
        setEditingItem(null)
    }

    const startEdit = (index) => {
        setEditingIndex(index)
        setEditingItem({ ...items[index] })
        setIsAdding(false) // Close add form if open
    }

    const handleRemove = (index) => {
        onChange(items.filter((_, i) => i !== index))
        if (editingIndex === index) handleCancelEdit()
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-400 font-mono uppercase">Work Experience</label>
                {!isAdding && (
                    <Button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        variant="ghost"
                        className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                    >
                        <Plus className="h-3 w-3 mr-1.5" /> Add Role
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
                            <div className="p-2 rounded bg-blue-500/10 text-blue-400">
                                <Briefcase className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-white">{item.position}</h4>
                                <p className="text-xs text-neutral-400">{item.company}</p>
                                <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-500 font-mono">
                                    <CalendarIcon className="h-3 w-3" />
                                    {item.startDate ? format(new Date(item.startDate), "MMM yyyy") : ''} — {item.current ? 'Present' : (item.endDate ? format(new Date(item.endDate), "MMM yyyy") : '')}
                                </div>
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
                            <label className="text-[10px] uppercase text-neutral-500">Company</label>
                            <input
                                value={newItem.company}
                                onChange={e => setNewItem({ ...newItem, company: e.target.value })}
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-blue-500/50"
                                placeholder="Acme Inc."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase text-neutral-500">Position</label>
                            <input
                                value={newItem.position}
                                onChange={e => setNewItem({ ...newItem, position: e.target.value })}
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-blue-500/50"
                                placeholder="Product Designer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase text-neutral-500">Start Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-black/20 border-white/10 text-white hover:bg-white/5",
                                            !newItem.startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newItem.startDate ? format(new Date(newItem.startDate), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-white/10 text-white" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={newItem.startDate ? new Date(newItem.startDate) : undefined}
                                        onSelect={(date) => setNewItem({ ...newItem, startDate: date ? date.toISOString() : '' })}
                                        initialFocus
                                        className="bg-[#0A0A0A] text-white"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] uppercase text-neutral-500">End Date</label>
                                <div
                                    onClick={() => setNewItem({ ...newItem, current: !newItem.current })}
                                    className="flex items-center gap-2 cursor-pointer group select-none"
                                >
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${newItem.current ? 'bg-blue-500' : 'bg-white/10 group-hover:bg-white/20'}`}>
                                        <div className={`h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${newItem.current ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <span className={`text-[10px] transition-colors ${newItem.current ? 'text-blue-400 font-medium' : 'text-neutral-400 group-hover:text-neutral-300'}`}>Current Role</span>
                                </div>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild disabled={newItem.current}>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-black/20 border-white/10 text-white hover:bg-white/5 disabled:opacity-50",
                                            !newItem.endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newItem.endDate ? format(new Date(newItem.endDate), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-white/10 text-white" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={newItem.endDate ? new Date(newItem.endDate) : undefined}
                                        onSelect={(date) => setNewItem({ ...newItem, endDate: date ? date.toISOString() : '' })}
                                        initialFocus
                                        className="bg-[#0A0A0A] text-white"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
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
                            className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[80px]"
                            placeholder="Key responsibilities and achievements..."
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
                            Add Position
                        </Button>
                    </div>
                </div>
            )}

            {/* Editing Form Modal/Inline */}
            {editingIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-4 w-full max-w-lg bg-[#0A0A0A] shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-semibold text-white">Edit Position</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase text-neutral-500">Company</label>
                                <input
                                    value={editingItem.company}
                                    onChange={e => setEditingItem({ ...editingItem, company: e.target.value })}
                                    className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase text-neutral-500">Position</label>
                                <input
                                    value={editingItem.position}
                                    onChange={e => setEditingItem({ ...editingItem, position: e.target.value })}
                                    className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-blue-500/50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase text-neutral-500">Start Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-black/20 border-white/10 text-white hover:bg-white/5",
                                                !editingItem.startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editingItem.startDate ? format(new Date(editingItem.startDate), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-white/10 text-white" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={editingItem.startDate ? new Date(editingItem.startDate) : undefined}
                                            onSelect={(date) => setEditingItem({ ...editingItem, startDate: date ? date.toISOString() : '' })}
                                            initialFocus
                                            className="bg-[#0A0A0A] text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase text-neutral-500">End Date</label>
                                    <div
                                        onClick={() => setEditingItem({ ...editingItem, current: !editingItem.current })}
                                        className="flex items-center gap-2 cursor-pointer group select-none"
                                    >
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${editingItem.current ? 'bg-blue-500' : 'bg-white/10 group-hover:bg-white/20'}`}>
                                            <div className={`h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${editingItem.current ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                        <span className={`text-[10px] transition-colors ${editingItem.current ? 'text-blue-400 font-medium' : 'text-neutral-400 group-hover:text-neutral-300'}`}>Current Role</span>
                                    </div>
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild disabled={editingItem.current}>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-black/20 border-white/10 text-white hover:bg-white/5 disabled:opacity-50",
                                                !editingItem.endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editingItem.endDate ? format(new Date(editingItem.endDate), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-white/10 text-white" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={editingItem.endDate ? new Date(editingItem.endDate) : undefined}
                                            onSelect={(date) => setEditingItem({ ...editingItem, endDate: date ? date.toISOString() : '' })}
                                            initialFocus
                                            className="bg-[#0A0A0A] text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
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
                                className="glass-input w-full rounded px-2 py-1.5 text-sm text-white bg-black/20 outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[120px]"
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

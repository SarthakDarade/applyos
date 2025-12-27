'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ArrayInput({ label, items = [], onChange, placeholder = "Add item..." }) {
    const [inputValue, setInputValue] = useState('')

    const handleAdd = () => {
        if (inputValue.trim()) {
            onChange([...items, inputValue.trim()])
            setInputValue('')
        }
    }

    const handleRemove = (index) => {
        onChange(items.filter((_, i) => i !== index))
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
        }
    }

    return (
        <div className="space-y-3">
            <label className="text-xs font-medium text-neutral-400 capitalize">{label}</label>

            <div className="flex flex-wrap gap-2 mb-2">
                {items.map((item, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-200">
                        {item}
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="hover:text-red-400 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 glass-input rounded-lg px-3 py-2 text-sm text-white bg-black/20 focus:bg-black/40 outline-none focus:ring-1 focus:ring-white/20"
                />
                <Button
                    type="button"
                    onClick={handleAdd}
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20 text-white border-none"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

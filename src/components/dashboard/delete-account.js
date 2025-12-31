'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { deleteAccount } from '@/app/actions/professional-profile'
import { AlertTriangle, Trash2 } from 'lucide-react'

export function DeleteAccount() {
    const [confirm, setConfirm] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!confirm) return
        setLoading(true)
        try {
            await deleteAccount()
        } catch (e) {
            alert(`Error: ${e.message}`)
            setLoading(false)
        }
    }

    return (
        <div className="glass-panel p-6 rounded-xl border border-red-500/10 bg-red-500/5">
            <div className="flex items-start gap-4 mb-6">
                <div className="h-10 w-10 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                    <h3 className="text-white font-medium">Delete Account</h3>
                    <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
                        Permanently delete your account and all associated data (Resumes, Applications, Preferences). This action cannot be undone.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-red-500/10 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={confirm}
                        onChange={(e) => setConfirm(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-600 bg-neutral-900/50 text-red-500 focus:ring-red-500/50"
                    />
                    <span className="text-xs text-neutral-400 hover:text-white transition-colors">
                        I confirm I want to delete my data.
                    </span>
                </label>

                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={!confirm || loading}
                    className="bg-red-500 hover:bg-red-600 text-white border-none h-9 text-xs"
                >
                    {loading ? 'Deleting...' : 'Delete Account'}
                </Button>
            </div>
        </div>
    )
}

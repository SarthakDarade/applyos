import { Trash2, Loader2, Edit2, MoreHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { EditApplicationForm } from '@/components/applications/edit-application-form';

export function ApplicationActions({ app }) {
    const supabase = createClient();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    // Guard clause if app is missing for some reason
    if (!app) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const table = app.is_manual ? 'manual_applications' : 'applications';
            const { error } = await supabase.from(table).delete().eq('id', app.id);

            if (error) throw error;
            setOpenDelete(false);
            router.refresh();
        } catch (error) {
            console.error('Error deleting application:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {showEdit && (
                <EditApplicationForm app={app} onCancel={() => setShowEdit(false)} />
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-1.5 hover:bg-white/10 rounded-md text-neutral-500 hover:text-white transition-colors outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-white/10">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                        onClick={() => setShowEdit(true)}
                        className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setOpenDelete(true)}
                        className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Popover (Controlled by state, but rendered outside dropdown to avoid closing issues) */}
            {openDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-white">Delete &quot;{app.jobs.title}&quot;?</h4>
                            <p className="text-sm text-neutral-400">
                                Are you sure you want to delete this application? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 text-sm">
                            <button
                                onClick={() => setOpenDelete(false)}
                                className="px-3 py-2 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center"
                            >
                                {isDeleting && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

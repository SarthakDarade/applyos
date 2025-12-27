'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddApplicationForm } from '@/components/applications/add-application-form';

export function ApplicationHeader() {
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">My Applications</h1>
                <p className="text-neutral-400 mt-1">Track your job application history</p>
            </div>
            <Button
                onClick={() => setShowAddForm(true)}
                className="bg-white text-black hover:bg-neutral-200 gap-2"
            >
                <Plus className="w-4 h-4" />
                Track Application
            </Button>

            {showAddForm && (
                <AddApplicationForm onCancel={() => setShowAddForm(false)} />
            )}
        </div>
    );
}

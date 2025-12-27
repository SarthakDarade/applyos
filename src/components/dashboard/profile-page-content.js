'use client';

import { useState, useEffect } from 'react';
import { ProfileView } from '@/components/dashboard/profile-view';
import { ProfileForm } from '@/components/dashboard/profile-form';

import { updateProfessionalProfile } from '@/app/actions/professional-profile';

export function ProfilePageContent({ initialProfile }) {
    const [isEditing, setIsEditing] = useState(!initialProfile?.full_name);
    const [profile, setProfile] = useState(initialProfile);

    // Sync state when server revalidates data (after save)
    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
        }
    }, [initialProfile]);

    const handleSaveSuccess = () => {
        setIsEditing(false);
        // Optional: Scroll to top?
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAvatarUpdate = async (newStyle) => {
        // Optimistic update
        setProfile(p => ({ ...p, avatar_style: newStyle }));
        try {
            await updateProfessionalProfile(profile.user_id, { ...profile, avatar_style: newStyle });
        } catch (error) {
            console.error("Failed to save avatar", error);
        }
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {!isEditing ? (
                <ProfileView
                    profile={profile}
                    onEdit={() => setIsEditing(true)}
                    onAvatarUpdate={handleAvatarUpdate}
                />
            ) : (
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Edit Profile</h1>
                        <p className="text-neutral-400 mt-1">Update your professional identity.</p>
                    </div>
                    <ProfileForm
                        profile={profile}
                        onSuccess={handleSaveSuccess}
                    />
                    <div className="pt-4 border-t border-white/5 flex justify-end">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-sm text-neutral-500 hover:text-white transition-colors"
                        >
                            Cancel Editing
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

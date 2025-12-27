import { User, Mail, MapPin, Briefcase } from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'

export function ProfileSummary({ user, profile }) {
    // Fallback data if profile is not fully set up
    const email = user?.email || 'user@example.com'
    // Prioritize Profile Table Data
    const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'
    const location = profile?.location || 'Not set'

    // Handle target_roles which can be Array (from new DB schema) or String
    let roleDisplay = 'Not set'

    // Check new schema 'headline' first
    if (profile?.headline) {
        roleDisplay = profile.headline
    }
    // Fallback to 'current_role' (usually array)
    else if (profile?.current_role) {
        if (Array.isArray(profile.current_role)) {
            roleDisplay = profile.current_role.join(', ')
        } else {
            roleDisplay = profile.current_role
        }
    }
    // Legacy fallback
    else if (profile?.target_roles) {
        if (Array.isArray(profile.target_roles)) {
            roleDisplay = profile.target_roles.join(', ')
        } else {
            roleDisplay = profile.target_roles
        }
    }

    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

    // Determine status
    const hasRole = profile?.headline || (profile?.current_role && profile.current_role.length > 0) || (profile?.target_roles && profile.target_roles.length > 0)
    const status = (profile?.full_name && hasRole) ? 'active' : 'pending'

    return (
        <div className="glass-panel p-6 rounded-xl space-y-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {avatarUrl ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={avatarUrl}
                                alt={fullName}
                                className="h-12 w-12 rounded-full border border-white/10 object-cover"
                            />
                        </>
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <span className="text-lg font-bold text-neutral-400">{fullName?.[0]?.toUpperCase()}</span>
                        </div>
                    )}
                    <div>
                        <h3 className="text-white font-medium">{fullName}</h3>
                        <p className="text-sm text-neutral-500">{email}</p>
                    </div>
                </div>
                <StatusBadge status={status} label={status === 'active' ? 'Profile Active' : 'Incomplete'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5 uppercase tracking-wide">
                        <Briefcase className="h-3 w-3" /> Current Role
                    </p>
                    <p className="text-sm text-neutral-200">{roleDisplay}</p>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5 uppercase tracking-wide">
                        <MapPin className="h-3 w-3" /> Location
                    </p>
                    <p className="text-sm text-neutral-200">{location}</p>
                </div>
            </div>

            {/* 
        TODO: Enable edit mode in future iteration 
        <div className="pt-2">
           <Button variant="outline" className="w-full text-xs h-8">Edit Profile</Button> 
        </div>
      */}
        </div>
    )
}

import { createClient } from '@/lib/supabase/server'
import { getProfessionalProfile } from '@/app/actions/professional-profile'
import { ProfilePageContent } from '@/components/dashboard/profile-page-content'

export const metadata = {
    title: 'My Profile - ApplyOS',
}

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Try to fetch existing professional profile
    let profile = await getProfessionalProfile(user.id)

    // 2. If no professional profile, try to fetch migration data from old profiles table
    if (!profile) {
        const { data: oldProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (oldProfile) {
            // Safe handling of current_role (could be string or array)
            let headline = ''
            if (Array.isArray(oldProfile.current_role)) {
                headline = oldProfile.current_role[0] || ''
            } else if (typeof oldProfile.current_role === 'string') {
                headline = oldProfile.current_role
            }

            // Map old profile to new schema structure
            profile = {
                user_id: user.id,
                full_name: oldProfile.full_name || user.user_metadata?.full_name || '',
                location: oldProfile.location || '',
                headline: headline,
                professional_summary: oldProfile.bio || '',
                years_experience: oldProfile.experience_years || 0,
                skills: oldProfile.skills || [],
                website: oldProfile.portfolio_url || '',
                linkedin: oldProfile.linkedin_url || '',
                email: oldProfile.email || user.email || '',

                // Default empty for complex objects not present in old schema
                current_position: {},
                work_experience: [],
                education: [],
                projects: [],
                certifications: [],
                achievements: [],
                languages: [],
                interests: []
            }
        } else {
            // New user, minimal defaults
            profile = {
                user_id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || ''
            }
        }
    }

    // Normalize Skills (Fix for JSON stringified skills issue)
    if (profile && Array.isArray(profile.skills)) {
        let normalizedSkills = [];
        profile.skills.forEach(skill => {
            if (typeof skill === 'string' && (skill.trim().startsWith('{') || skill.trim().startsWith('['))) {
                try {
                    const parsed = JSON.parse(skill);
                    if (parsed.items && Array.isArray(parsed.items)) {
                        normalizedSkills.push(...parsed.items);
                    } else if (Array.isArray(parsed)) {
                        normalizedSkills.push(...parsed);
                    } else {
                        // If it's just a string, keep it? Or if it's an object without items?
                        // If it is {name: "Skill"}, maybe use name?
                        // For the specific screenshot case, it's {name: "Group", items: [...]}.
                        normalizedSkills.push(skill); // Fallback to avoid data loss if pattern doesn't match
                    }
                } catch (e) {
                    normalizedSkills.push(skill);
                }
            } else if (typeof skill === 'object' && skill !== null && skill.items) {
                // specific case if raw object
                normalizedSkills.push(...(skill.items || []));
            } else {
                normalizedSkills.push(skill);
            }
        });

        // Final pass to ensure all are strings and flatten
        // The above push(...items) might push non-strings if items contained objects? 
        // Assuming items are strings based on screenshot.
        // Let's filter to be safe.
        // Also remove the original JSON strings from the list if we successfully extracted from them.

        // Refined Logic:
        const refinedSkills = [];
        profile.skills.forEach(skill => {
            let processed = false;
            if (typeof skill === 'string' && (skill.trim().startsWith('{') || skill.trim().startsWith('['))) {
                try {
                    const parsed = JSON.parse(skill);
                    if (parsed.items && Array.isArray(parsed.items)) {
                        refinedSkills.push(...parsed.items);
                        processed = true;
                    } else if (Array.isArray(parsed)) {
                        refinedSkills.push(...parsed);
                        processed = true;
                    }
                } catch (e) {
                    // ignore parse error
                }
            }
            if (!processed) {
                refinedSkills.push(skill);
            }
        });

        // De-duplicate and filter strings
        profile.skills = [...new Set(refinedSkills)].filter(s => typeof s === 'string');
    }

    return (
        <ProfilePageContent initialProfile={profile} />
    )
}

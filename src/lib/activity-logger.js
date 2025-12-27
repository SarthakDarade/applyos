'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

/**
 * Logs a user activity to Supabase
 * @param {string} action - Short title of action (e.g. "Updated Profile")
 * @param {string} [description] - details
 * @param {object} [metadata] - extra data
 */
export async function logActivity(action, description = '', metadata = {}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return // Can't log if not auth

        // Capture basic request context safely
        const headerList = await headers()
        const userAgent = headerList.get('user-agent') || 'unknown'
        // IP is often 'x-forwarded-for' but depends on hosting. 
        // We'll skip IP to avoid PII complexity for now, or just store UA.

        const payload = {
            user_id: user.id,
            action,
            description,
            metadata: {
                ...metadata,
                userAgent
            }
        }

        // Fire and forget - don't block main thread too much
        // But in Server Actions without background workers, we must await to ensure completion before process exit.
        await supabase.from('user_activity_log').insert(payload)

    } catch (err) {
        console.error('Failed to log activity:', err)
        // Swallow error so we don't crash main flow
    }
}

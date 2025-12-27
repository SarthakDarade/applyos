'use server'

import { logActivity } from '@/lib/activity-logger'

// Wrapper to expose logger to client components specifically
export async function logClientActivity(action, description, metadata) {
    await logActivity(action, description, metadata)
}

import { calculateProfileContext } from './insights'

export function calculateApplyReadiness(profile, fitAnalysis) {
    if (!profile || !fitAnalysis) return null

    // Get Profile Completeness
    const { healthScore } = calculateProfileContext(profile)
    const fitScore = fitAnalysis.score || 0
    const missingSkills = fitAnalysis.skills?.missing || []

    // Default: Not Ready
    let status = 'NOT_READY'
    let label = 'Needs Improvement'
    let explanation = 'Key requirements are currently missing.'
    let hints = []

    // 1. Ready Check
    if (fitScore >= 70 && healthScore >= 75 && missingSkills.length <= 1) {
        status = 'READY'
        label = 'Ready to Apply'
        explanation = 'Your profile aligns well with this role.'
    }
    // 2. Partially Ready Check
    else if (fitScore >= 45 || healthScore >= 60) {
        status = 'PARTIALLY_READY'
        label = 'Partially Ready'
        explanation = 'Some skill gaps may affect alignment.'

        if (healthScore < 60) {
            explanation = 'Profile completeness suggests more detail needed.'
            hints.push('Complete your profile sections')
        } else if (missingSkills.length > 0) {
            hints.push('Consider highlighting relevant skills')
        }
    }
    else {
        // Not Ready
        if (healthScore < 50) {
            hints.push('Review experience details')
        }
        if (missingSkills.length > 3) {
            hints.push('Add missing skills to improve alignment')
        }
    }

    return {
        status,
        label,
        explanation,
        hints: hints.slice(0, 2)
    }
}

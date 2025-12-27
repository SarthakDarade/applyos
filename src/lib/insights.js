export function calculateProfileContext(profile) {
    if (!profile) return { healthScore: 0, completenessScore: 0, suggestions: [] }

    const skillsCount = profile.skills?.length || 0
    const hasWork = profile.work_experience?.length > 0 || Object.keys(profile.work_experience || {}).length > 0
    const hasEducation = profile.education?.length > 0 || Object.keys(profile.education || {}).length > 0
    const hasLocation = !!profile.location
    const hasHeadline = !!profile.headline
    const hasSummary = !!profile.professional_summary

    // 1. Health Score Calculation (0-100)
    // Weighted more towards "quality" signal than just filling fields
    let healthScore = 0

    // Core Identity (20pts)
    if (hasLocation) healthScore += 10
    if (hasHeadline) healthScore += 10

    // Skills Volume (30pts)
    if (skillsCount >= 5) healthScore += 30
    else if (skillsCount >= 3) healthScore += 15
    else if (skillsCount > 0) healthScore += 5

    // Experience Depth (30pts)
    if (hasWork) healthScore += 30

    // Education (20pts)
    if (hasEducation) healthScore += 20

    // 2. Suggestions Generation
    const suggestions = []

    if (skillsCount < 3) {
        suggestions.push({
            id: 'add_skills',
            text: 'Add at least 3 more key skills',
            impact: 'High',
            action: 'Update Skills'
        })
    } else if (skillsCount < 8) {
        suggestions.push({
            id: 'expand_skills',
            text: 'Expand your skill set to improve matching',
            impact: 'Medium',
            action: 'Add Skills'
        })
    }

    if (!hasWork) {
        suggestions.push({
            id: 'add_experience',
            text: 'Add work experience to demonstrate history',
            impact: 'High',
            action: 'Add Experience'
        })
    }

    if (!hasEducation) {
        suggestions.push({
            id: 'add_education',
            text: 'Include education details',
            impact: 'Medium',
            action: 'Update Education'
        })
    }

    if (!hasSummary) {
        suggestions.push({
            id: 'add_summary',
            text: 'Write a professional summary',
            impact: 'Medium',
            action: 'Edit Profile'
        })
    }

    // Fallback if doing great
    if (suggestions.length === 0) {
        suggestions.push({
            id: 'keep_updated',
            text: 'Keep your profile updated with new projects',
            impact: 'Low',
            action: 'Review'
        })
    }

    return {
        healthScore,
        completenessScore: healthScore, // syncing for now, but logical distinction exists
        suggestions: suggestions.slice(0, 4) // Limit to top 4
    }
}

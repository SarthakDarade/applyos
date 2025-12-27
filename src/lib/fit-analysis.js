export function calculateJobFit(profile, job) {
    if (!profile || !job) return { score: 0, readiness: 'Unknown' }

    // 1. Skills (40 pts)
    const jobSkills = job.skills_required || []
    const profileSkills = profile.skills || []

    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim())
    const normalizedProfileSkills = profileSkills.map(s => s.toLowerCase().trim())

    const matchedSkills = jobSkills.filter((s, i) =>
        normalizedProfileSkills.includes(normalizedJobSkills[i])
    )
    const missingSkills = jobSkills.filter((s, i) =>
        !normalizedProfileSkills.includes(normalizedJobSkills[i])
    )

    const skillMatchPercentage = jobSkills.length > 0
        ? matchedSkills.length / jobSkills.length
        : 0

    // If job has no skills defined, we give neutral partial credit (20) to not punish user
    // If job has skills, we score proportionally up to 40
    let skillScore = jobSkills.length > 0 ? (skillMatchPercentage * 40) : 20

    // 2. Experience (30 pts)
    const levelMap = {
        'Internship': 0,
        'Junior': 1,
        'Mid-Level': 3,
        'Senior': 5,
        'Lead': 7,
        'Manager': 7,
        'Director': 10
    }
    // Default to 2 years if unknown string
    const requiredYears = levelMap[job.experience_level] !== undefined ? levelMap[job.experience_level] : 2
    const userYears = profile.years_experience || 0

    let expScore = 0
    let expStatus = 'Below Requirement'

    if (userYears >= requiredYears) {
        expScore = 30
        expStatus = 'Aligned'
        if (userYears >= requiredYears + 3) expStatus = 'Above Requirement'
    } else if (userYears >= Math.max(0, requiredYears - 1)) {
        expScore = 15 // Close enough
        expStatus = 'Near Requirement'
    } else {
        expScore = 0
    }

    // 3. Role/Title (20 pts)
    const jobTitle = (job.title || "").toLowerCase()
    const userHeadline = (profile.headline || "").toLowerCase()
    // Try to check last role if possible, but headline is a good proxy for intent/identity

    let roleScore = 0
    let roleStatus = 'Different Role'

    // Simple word overlap for now (can be improved with embeddings later)
    const jobWords = jobTitle.split(/[\s-]+/).filter(w => w.length > 3)
    const userWords = userHeadline.split(/[\s-]+/).filter(w => w.length > 3)

    const intersection = jobWords.filter(w => userWords.some(uw => uw.includes(w) || w.includes(uw)))

    if (userHeadline.includes(jobTitle) || jobTitle.includes(userHeadline)) {
        roleScore = 20
        roleStatus = 'Direct Match'
    } else if (intersection.length > 0) {
        roleScore = 10
        roleStatus = 'Related Role'
    }

    // 4. Location (10 pts)
    let locScore = 0
    let locStatus = 'Different Location'
    const jobLoc = (job.location || "").toLowerCase()
    const userLoc = (profile.location || "").toLowerCase()

    if (jobLoc.includes('remote')) {
        locScore = 10
        locStatus = 'Remote Compatible'
    } else if (jobLoc === userLoc || userLoc.includes(jobLoc) || jobLoc.includes(userLoc)) {
        locScore = 10
        locStatus = 'Same Location'
    }

    // Totals
    const totalScore = Math.min(100, Math.round(skillScore + expScore + roleScore + locScore))

    // Readiness Label
    let readiness = 'Needs Improvement'
    if (totalScore >= 80) readiness = 'Excellent'
    else if (totalScore >= 60) readiness = 'Good'
    else if (totalScore >= 40) readiness = 'Moderate'
    else readiness = 'Low Alignment'

    // Strengths and Gaps for Summary
    const strengths = []
    const gaps = []

    if (skillMatchPercentage >= 0.7) strengths.push('Strong skill match')
    else if (matchedSkills.length > 0) strengths.push('Partial skill overlaps')
    else gaps.push('Skill coverage')

    if (userYears >= requiredYears) strengths.push('Experience is aligned')
    else gaps.push('Years of experience')

    if (roleScore > 10) strengths.push('Relevant role history')

    if (locScore === 10) strengths.push('Location compatible')
    else if (jobLoc && !jobLoc.includes('remote')) gaps.push('Location mismatch')

    return {
        score: totalScore,
        readiness,
        skills: { matched: matchedSkills, missing: missingSkills },
        experience: { status: expStatus, required: requiredYears, user: userYears },
        role: { status: roleStatus },
        location: { status: locStatus },
        strengths: strengths.slice(0, 3), // Top 3
        gaps: gaps.slice(0, 2) // Top 2
    }
}

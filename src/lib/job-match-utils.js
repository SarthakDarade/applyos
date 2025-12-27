export function calculateScore({ matchedCount, missingCount, relevantExpCount, riskCount }) {
    let score = 0;
    const totalSkills = matchedCount + missingCount;

    // Skills coverage (40%)
    if (totalSkills > 0) {
        score += (matchedCount / totalSkills) * 40;
    }

    // Experience relevance (30%)
    if (relevantExpCount > 0) {
        score += 30;
    }

    // Risk penalties (-10 each, max -30)
    score -= Math.min(riskCount * 10, 30);

    return Math.max(0, Math.min(100, Math.round(score)));
}

export function getMatchLevel(score) {
    if (score >= 70) return "Strong";
    if (score >= 45) return "Moderate";
    return "Weak";
}

export function getMatchSummary(level) {
    if (level === "Strong") {
        return "Strong alignment with most core job requirements.";
    }
    if (level === "Moderate") {
        return "Partial alignment with some missing skills or experience gaps.";
    }
    return "Limited alignment with key job requirements. This role may be a stretch without preparation.";
}


export const calculateResumeScore = (data) => {
    if (!data) return { score: 0, breakdown: {}, feedback: [] };

    let feedback = [];

    const personal = data.personal || {};
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const summary = data.summary || '';
    const allText = JSON.stringify(data).toLowerCase();

    // 1. ATS & Structure (20%)
    // - Contact info present
    // - Standard sections present
    let atsScore = 0;
    if (personal.name && personal.email && personal.phone) atsScore += 30;
    if (personal.location) atsScore += 10;
    if (experience.length > 0) atsScore += 20;
    if (education.length > 0) atsScore += 20;
    if (skills.length > 0) atsScore += 20;

    // 2. Content Quality (25%)
    // - Depth of experience details
    // - Metrics usage
    let contentScore = 0;
    if (experience.length >= 1) contentScore += 20;
    if (experience.length >= 2) contentScore += 10;

    let hasMetrics = false;
    let descLengthScore = 0;
    experience.forEach(exp => {
        const desc = String(exp.description || '');
        if (/\d+|%|\$/.test(desc)) hasMetrics = true;
        if (desc.split(' ').length > 20) descLengthScore += 10;
    });
    if (hasMetrics) contentScore += 40;
    contentScore += Math.min(30, descLengthScore); // Cap length score

    // 3. Job Optimization (20%)
    // - Keywords matching (generic check for now, can be improved with job desc match)
    // - Skills count
    let optimizationScore = 0;
    if (skills.length >= 5) optimizationScore += 50;
    else if (skills.length > 0) optimizationScore += skills.length * 10;

    const buzzwords = ['developed', 'led', 'managed', 'created', 'designed', 'implemented'];
    const hasBuzzwords = buzzwords.some(word => allText.includes(word));
    if (hasBuzzwords) optimizationScore += 50;

    // 4. Writing Quality (15%)
    // - Action verbs
    // - Summary length
    let writingScore = 0;
    const actionVerbs = ['achieved', 'improved', 'negotiated', 'launched', 'conceptualized', 'mentored'];
    const hasStrongVerbs = actionVerbs.some(verb => allText.includes(verb));
    if (hasStrongVerbs) writingScore += 50;

    if (summary.length > 100) writingScore += 50;
    else if (summary.length > 20) writingScore += 25;

    // 5. Application Ready (20%)
    // - LinkedIn/Portfolio links
    // - Completeness
    let readyScore = 0;
    if (personal.linkedin) readyScore += 40;
    if (personal.website || personal.url) readyScore += 20;
    if (projects.length > 0) readyScore += 20;
    if (data.certifications && data.certifications.length > 0) readyScore += 10;
    if (data.languages && data.languages.length > 0) readyScore += 10;


    // Formatting Feedback
    if (atsScore < 80) feedback.push({ category: 'ATS', message: 'Missing key contact info or sections.' });
    if (!hasMetrics) feedback.push({ category: 'Content', message: 'Quantify impact (e.g., "Increased X by 20%").' });
    if (skills.length < 5) feedback.push({ category: 'Optimization', message: 'Add at least 5 key skills.' });
    if (!personal.linkedin) feedback.push({ category: 'Ready', message: 'Add LinkedIn profile for better visibility.' });

    // Weighted Total
    // ATS (20%) + Content (25%) + Optimization (20%) + Writing (15%) + Ready (20%)
    let totalScore = (atsScore * 0.2) + (contentScore * 0.25) + (optimizationScore * 0.2) + (writingScore * 0.15) + (readyScore * 0.2);
    totalScore = Math.min(100, Math.round(totalScore));

    return {
        score: totalScore,
        breakdown: {
            ats: Math.min(100, atsScore),
            content: Math.min(100, contentScore),
            optimization: Math.min(100, optimizationScore),
            writing: Math.min(100, writingScore),
            ready: Math.min(100, readyScore)
        },
        feedback
    };
};

export const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
};

export const getScoreColorBg = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
};

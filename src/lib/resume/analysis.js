
// Basic list of Action Verbs for Analysis
const ACTION_VERBS = [
    'achieved', 'added', 'advised', 'analyzed', 'assembled', 'assessed', 'built', 'calculated', 'collaborated',
    'completed', 'conducted', 'constructed', 'coordinated', 'created', 'delivered', 'designed', 'developed',
    'directed', 'documented', 'earned', 'edited', 'engineered', 'established', 'evaluated', 'expanded',
    'facilitated', 'forecasted', 'formulated', 'generated', 'guided', 'implemented', 'improved', 'increased',
    'initiated', 'innovated', 'integrated', 'introduced', 'investigated', 'launched', 'led', 'managed',
    'maximized', 'measured', 'mentored', 'modernized', 'negotiated', 'optimized', 'organized', 'originated',
    'performed', 'planned', 'prepared', 'presented', 'produced', 'programmed', 'projected', 'promoted',
    'provided', 'published', 'reduced', 'refined', 'regulated', 'resolved', 'restructured', 'revamped',
    'reviewed', 'revised', 'saved', 'scheduled', 'secured', 'selected', 'simplified', 'solved', 'spearheaded',
    'standardized', 'started', 'streamlined', 'strengthened', 'structured', 'supervised', 'supported',
    'surpassed', 'synthesized', 'targeted', 'taught', 'tested', 'trained', 'translated', 'upgraded', 'utilized',
    'validated', 'verified', 'visualized', 'won', 'wrote'
];

export const analyzeResume = (data) => {
    let score = 0;
    const feedback = {
        content: { score: 0, max: 20, issues: [] },
        ats: { score: 0, max: 20, issues: [] },
        optimization: { score: 0, max: 20, issues: [] },
        writing: { score: 0, max: 20, issues: [] },
        readiness: { score: 0, max: 20, issues: [] }
    };

    if (!data) return { score: 0, feedback };

    // 1. Content Quality (20pts)
    // Basic Contact Info
    let contentScore = 0;
    if (data.personal?.name) contentScore += 2;
    if (data.personal?.email) contentScore += 2;
    if (data.personal?.phone) contentScore += 2;
    if (data.personal?.linkedin) contentScore += 2;
    if (data.summary && data.summary.length > 50) contentScore += 4;
    else feedback.content.issues.push("Summary is missing or too short (min 50 chars).");

    // Sections Existence
    if (data.experience && data.experience.length > 0) contentScore += 4;
    else feedback.content.issues.push("Add at least one experience entry.");

    if (data.education && data.education.length > 0) contentScore += 4;
    else feedback.content.issues.push("Add your education details.");

    feedback.content.score = Math.min(contentScore, 20);


    // 2. ATS & Structure (20pts)
    // Structure is largely handled by our template, so we check for "Good Data for ATS"
    let atsScore = 20;
    // Penalize for missing dates or locations which confuses parsers
    let missingDates = 0;
    if (data.experience) {
        data.experience.forEach(exp => { if (!exp.dates) missingDates++; });
    }
    if (data.education) {
        data.education.forEach(edu => { if (!edu.dates) missingDates++; });
    }

    if (missingDates > 0) {
        atsScore -= (missingDates * 2);
        feedback.ats.issues.push(`Found ${missingDates} entries without dates. Dates are crucial for ATS parsing.`);
    }

    // Check for "skills" keywords density (simple proxy)
    const skillsCount = Array.isArray(data.skills)
        ? data.skills.reduce((acc, cat) => acc + (Array.isArray(cat.items) ? cat.items.length : 0), 0)
        : (data.skills?.technical?.length || 0) + (data.skills?.soft?.length || 0);

    if (skillsCount < 5) {
        atsScore -= 5;
        feedback.ats.issues.push("Low skill count. ATS systems look for skills keywords. Add more relevant skills.");
    }
    feedback.ats.score = Math.max(0, atsScore);


    // 3. Job Optimization (20pts) - Quantifiable Results
    let optScore = 0;
    let quantifiables = 0;
    const numRegex = /\d+|%|\$|increased|reduced|saved|improved|grew/i;

    const checkBullets = (items) => {
        if (!items) return;
        items.forEach(item => {
            if (typeof item === 'string' && numRegex.test(item)) quantifiables++;
            // Check arrays (descriptions)
            if (Array.isArray(item.description)) {
                item.description.forEach(desc => {
                    if (numRegex.test(desc)) quantifiables++;
                });
            } else if (typeof item.description === 'string' && numRegex.test(item.description)) {
                quantifiables++;
            }
        });
    };

    checkBullets(data.experience);
    checkBullets(data.projects);
    checkBullets(data.achievements); // array of strings

    // Cap at 15 points for quantifiables (3 points each)
    optScore = Math.min(quantifiables * 3, 15);
    if (quantifiables < 3) feedback.optimization.issues.push("Add more quantifiable results (numbers, %, $) to your descriptions.");

    // Bonus for having strict "Role" titles
    let hasRoles = true;
    if (data.experience) {
        data.experience.forEach(exp => { if (!exp.role) hasRoles = false; });
    }
    if (hasRoles && data.experience?.length > 0) optScore += 5;

    feedback.optimization.score = Math.min(optScore, 20);


    // 4. Writing Quality (20pts) - Action Verbs & Length
    let writeScore = 0;
    let bulletPointsCount = 0;
    let strongBullets = 0;
    let weakBullets = 0; // too short/long

    const checkWriting = (items) => {
        if (!items) return;
        const processDesc = (desc) => {
            bulletPointsCount++;
            const cleanDesc = desc.trim();
            // Check Length
            if (cleanDesc.length < 20 || cleanDesc.length > 300) weakBullets++;

            // Check Action Verb
            const firstWord = cleanDesc.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
            if (ACTION_VERBS.includes(firstWord)) strongBullets++;
        };

        items.forEach(item => {
            if (typeof item === 'string') processDesc(item); // achievements
            if (Array.isArray(item.description)) {
                item.description.forEach(d => processDesc(d));
            } else if (typeof item.description === 'string') {
                processDesc(item.description);
            }
        });
    };

    checkWriting(data.experience);
    checkWriting(data.projects);
    checkWriting(data.achievements);

    // Scoring
    if (bulletPointsCount > 0) {
        const verbRatio = strongBullets / bulletPointsCount;
        writeScore += (verbRatio * 15); // max 15 for verbs

        if (verbRatio < 0.5) feedback.writing.issues.push("Use more strong action verbs at the start of your bullet points.");

        const lengthRatio = (bulletPointsCount - weakBullets) / bulletPointsCount;
        writeScore += (lengthRatio * 5); // max 5 for formatting
        if (weakBullets > 0) feedback.writing.issues.push("Some bullet points are too short or too long. Aim for 1-2 lines.");
    } else {
        feedback.writing.issues.push("Add detailed bullet points to your experience or projects.");
    }

    feedback.writing.score = Math.min(Math.round(writeScore), 20);


    // 5. Application Readiness (20pts) -> Completeness & Polish
    let readyScore = 20;

    // Penalty for "placeholder" text
    const placeholders = ['Your Name', 'Company Name', 'Role Title', 'Description...', 'City, Country'];
    let placeholderCount = 0;
    const checkPlaceholders = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                if (placeholders.some(p => obj[key].includes(p))) placeholderCount++;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                checkPlaceholders(obj[key]);
            }
        }
    };
    checkPlaceholders(data);

    if (placeholderCount > 0) {
        readyScore -= (placeholderCount * 5);
        feedback.readiness.issues.push(`You have ${placeholderCount} placeholder texts remaining. Please update them.`);
    }

    // Must have email to be ready
    if (!data.personal?.email || data.personal.email.includes('example.com')) {
        readyScore -= 10;
        feedback.readiness.issues.push("Invalid or missing email address.");
    }

    feedback.readiness.score = Math.max(0, readyScore);


    // Total
    score = feedback.content.score + feedback.ats.score + feedback.optimization.score + feedback.writing.score + feedback.readiness.score;

    return { score, feedback };
};

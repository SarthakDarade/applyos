
export const DEFAULT_SECTIONS = [
    { id: 'summary', label: 'Professional Summary', type: 'summary', enabled: true, content: '' },
    { id: 'experience', label: 'Professional Experience', type: 'experience', enabled: true, items: [] },
    { id: 'education', label: 'Education', type: 'education', enabled: true, items: [] },
    { id: 'projects', label: 'Projects', type: 'projects', enabled: true, items: [] },
    { id: 'skills', label: 'Skills', type: 'skills', enabled: true, items: [] },
    { id: 'achievements', label: 'Achievements', type: 'achievements', enabled: true, items: [] },
    // Optional / Hidden by default
    { id: 'internships', label: 'Internships', type: 'experience', enabled: false, items: [] },
    { id: 'hackathons', label: 'Hackathons', type: 'projects', enabled: false, items: [] },
    { id: 'certifications', label: 'Certifications', type: 'achievements', enabled: false, items: [] },
    { id: 'awards', label: 'Awards', type: 'achievements', enabled: false, items: [] },
    { id: 'volunteering', label: 'Volunteering', type: 'experience', enabled: false, items: [] },
    // User Requested Additional Sections
    { id: 'objective', label: 'Career Objective', type: 'summary', enabled: false, content: '' },
    { id: 'leadership', label: 'Leadership', type: 'experience', enabled: false, items: [] },
    { id: 'research', label: 'Research', type: 'projects', enabled: false, items: [] },
    { id: 'publications', label: 'Publications', type: 'achievements', enabled: false, items: [] }
];

export function transformToSectionFormat(flatData) {
    if (!flatData) return { personal: {}, sections: DEFAULT_SECTIONS };

    // Helper to normalize items within sections
    const normalizeSections = (sectionsList) => {
        return sectionsList.map(sec => {
            // Only process sections that have an 'items' array
            if (!sec.items || !Array.isArray(sec.items)) return sec;

            const normalizedItems = sec.items.map(item => {
                if (typeof item === 'string') {
                    // Convert legacy string items to objects
                    return {
                        id: Date.now() + Math.random(), // Unique ID
                        title: item,       // Common field
                        name: item,        // For skills/projects
                        description: item, // For achievements/experience
                        enabled: true      // Default to enabled
                    };
                }
                if (typeof item === 'object' && item !== null) {
                    // Ensure ID exists for existing objects
                    return { ...item, id: item.id || (Date.now() + Math.random()) };
                }
                return null; // Filter out invalid types
            }).filter(Boolean); // Remove any nulls from the map operation

            return { ...sec, items: normalizedItems };
        });
    };

    // Check if it's already in Section Format (has 'sections' array)
    if (flatData.sections && Array.isArray(flatData.sections)) {
        // Merge with any new default sections that might be missing from the saved data
        // This ensures new features appear for existing users
        const savedIds = new Set(flatData.sections.map(s => s.id));
        const missingSections = DEFAULT_SECTIONS.filter(s => !savedIds.has(s.id));

        const mergedSections = [...flatData.sections, ...missingSections];

        return {
            personal: flatData.personal || {},
            sections: normalizeSections(mergedSections) // Apply normalization here
        };
    }

    // Deep copy default sections to ensure we have the structure
    const sections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));

    const mapItems = (id, sourceKey) => {
        const sec = sections.find(s => s.id === id);
        if (sec && flatData[sourceKey]) {
            const rawItems = Array.isArray(flatData[sourceKey]) ? flatData[sourceKey] : [];
            // Assign raw items; normalization will happen at the end
            sec.items = rawItems;
            sec.enabled = sec.items.length > 0;
        }
    };

    const summarySec = sections.find(s => s.id === 'summary');
    if (summarySec && flatData.summary) {
        summarySec.content = flatData.summary;
    }

    // Auto-map objective if it exists in flat data
    const objectiveSec = sections.find(s => s.id === 'objective');
    if (objectiveSec && flatData.objective) {
        objectiveSec.content = flatData.objective;
        objectiveSec.enabled = true;
    }

    mapItems('experience', 'experience');
    mapItems('education', 'education');
    mapItems('projects', 'projects');
    mapItems('skills', 'skills');
    mapItems('achievements', 'achievements');

    // Optional mappings
    mapItems('internships', 'internships');
    mapItems('hackathons', 'hackathons');
    mapItems('certifications', 'certifications');
    mapItems('awards', 'awards');
    mapItems('volunteering', 'volunteering');

    // New mappings
    mapItems('leadership', 'leadership');
    mapItems('research', 'research');
    mapItems('publications', 'publications');

    // Attempt to respect previous simple ordering if possible, but for now fixed default structure is safer for v1 migration
    // If the flatData has a 'meta.sectionOrder', we could reorder 'sections' array.
    if (flatData.meta?.sectionOrder && Array.isArray(flatData.meta.sectionOrder)) {
        const order = flatData.meta.sectionOrder;
        sections.sort((a, b) => {
            const idxA = order.indexOf(a.id);
            const idxB = order.indexOf(b.id);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1; // push unknown to end
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
    }

    return {
        personal: flatData.personal || {},
        sections: normalizeSections(sections)
    };
}

export function transformToFlatFormat(resumeJson) {
    if (!resumeJson) return {};

    const flat = {
        personal: resumeJson.personal || {},
        meta: {
            // Persist order in meta for backward compatibility if we revert
            sectionOrder: resumeJson.sections.filter(s => s.enabled).map(s => s.id)
        }
    };

    resumeJson.sections.forEach(section => {
        if (!section.enabled) return;

        switch (section.id) {
            case 'summary': flat.summary = section.content; break;
            case 'experience': flat.experience = section.items; break;
            case 'education': flat.education = section.items; break;
            case 'projects': flat.projects = section.items; break;
            case 'skills': flat.skills = section.items; break;
            case 'achievements': flat.achievements = section.items; break;

            // New Optional Sections
            case 'internships': flat.internships = section.items; break;
            case 'hackathons': flat.hackathons = section.items; break;
            case 'certifications': flat.certifications = section.items; break;
            case 'awards': flat.awards = section.items; break;
            case 'volunteering': flat.volunteering = section.items; break;

            // Requested Sections
            case 'objective': flat.objective = section.content; break;
            case 'leadership': flat.leadership = section.items; break;
            case 'research': flat.research = section.items; break;
            case 'publications': flat.publications = section.items; break;

            default: break;
        }
    });

    return flat;
}

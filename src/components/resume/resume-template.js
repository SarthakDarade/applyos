'use client';

// Professional JV-Style Resume Template
// Designed for clean ATS parsing and professional appearance
// Pure HTML/CSS (via Tailwind)

export function ResumeTemplate({ data }) {
    if (!data) return null;

    return (
        <div className="bg-white text-black font-serif p-[40px] max-w-[850px] mx-auto shadow-2xl min-h-[1100px] text-sm leading-relaxed" id="resume-preview">

            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">{data.personal?.name}</h1>
                <div className="flex justify-center flex-wrap gap-4 text-xs font-semibold uppercase tracking-wide text-gray-700">
                    {(data.personal?.location || data.personal?.country) && (
                        <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                            <span>{[data.personal?.location, data.personal?.country].filter(Boolean).join(', ')}</span>
                        </div>
                    )}
                    {data.personal?.phone && (
                        <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            <span>{data.personal.phone}</span>
                        </div>
                    )}
                    {data.personal?.email && (
                        <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                            <a href={`mailto:${data.personal.email}`} className="text-black hover:underline">{data.personal.email}</a>
                        </div>
                    )}
                    {data.personal?.linkedin && (
                        <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                            <a href={data.personal.linkedin.startsWith('http') ? data.personal.linkedin : `https://${data.personal.linkedin}`} target="_blank" rel="noreferrer" className="text-black hover:underline">
                                {data.personal.linkedin.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary */}
            {data.summary && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-3">Professional Summary</h2>
                    <p className="text-justify">{data.summary}</p>
                </div>
            )}

            {/* Experience */}
            {data.experience?.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-3">Professional Experience</h2>
                    <div className="space-y-5">
                        {data.experience.map((exp, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-base">{exp.company}</h3>
                                    <span className="font-semibold text-gray-700 whitespace-nowrap">{exp.dates}</span>
                                </div>
                                <div className="flex justify-between items-baseline mb-2 italic">
                                    <span>{exp.role}</span>
                                    {exp.location && <span className="text-gray-600">{exp.location}</span>}
                                </div>
                                <ul className="list-disc ml-4 space-y-1">
                                    {(Array.isArray(exp.description) ? exp.description : [exp.description]).map((bullet, j) => (
                                        <li key={j} className="text-justify pl-1">
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects (If any) */}
            {data.projects?.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-3">Projects</h2>
                    <div className="space-y-4">
                        {data.projects.map((proj, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold">{proj.name}</h3>
                                    {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">Link</a>}
                                </div>
                                <p className="text-justify">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {(data.skills?.technical?.length > 0 || data.skills?.soft?.length > 0) && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-3">Skills</h2>
                    <div className="grid grid-cols-1 gap-2">
                        {data.skills?.technical?.length > 0 && (
                            <div>
                                <span className="font-bold">Technical: </span>
                                {data.skills.technical.join(', ')}
                            </div>
                        )}
                        {data.skills?.soft?.length > 0 && (
                            <div>
                                <span className="font-bold">Soft Skills: </span>
                                {data.skills.soft.join(', ')}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Education */}
            {data.education?.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-3">Education</h2>
                    <div className="space-y-3">
                        {data.education.map((edu, i) => (
                            <div key={i} className="flex justify-between items-baseline">
                                <div>
                                    <h3 className="font-bold">{edu.school}</h3>
                                    <div className="italic">{edu.degree}</div>
                                </div>
                                <span className="font-semibold text-gray-700">{edu.dates}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

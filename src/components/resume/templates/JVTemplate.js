
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, Trash2, PlusCircle } from 'lucide-react';

const Field = ({ path, value, className, placeholder = '...', asCtx = 'span', onEdit, isList = false }) => {
    const Component = asCtx;
    const displayValue = value || placeholder;

    // Rich Text Parser
    const renderRichText = (text) => {
        if (typeof text !== 'string') return text;

        // Escape HTML to prevent XSS (basic) - though we are using React, we want to be safe if we were using dangerouslySetInnerHTML,
        // but here we will construct React nodes.
        // Actually, for simplicity and performance in this specific constrained environment,
        // we can splitting by syntax markers and returning an array of nodes.

        // Regex strategy:
        // We want to match **bold**, *italic*, __underline__, [link](url)
        // Order matters: Link first, then Bold, then Underline/Italic.

        // However, a simpler mixed regex split might be easier.
        // Let's try splitting by the tags.

        // NOTE: This is a basic parser. Nested tags might fail or need recursion.
        // For a resume editor, single level or simple nesting is usually enough. 
        // We'll use a sequential replacement approach or a tokenizing approach.

        const parts = [];
        let lastIndex = 0;

        // Regex for all supported tokens
        // Link: \[([^\]]+)\]\(([^)]+)\)
        // Bold: \*\*([^*]+)\*\*
        // Italic: \*([^*]+)\*
        // Underline: __([^_]+)__
        const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__)/g;

        let match;
        while ((match = regex.exec(text)) !== null) {
            // Add plain text before match
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }

            // Link
            if (match[1].startsWith('[')) {
                parts.push(<a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline print:text-black print:no-underline">{match[2]}</a>);
            }
            // Bold
            else if (match[1].startsWith('**')) {
                parts.push(<strong key={match.index}>{match[4]}</strong>);
            }
            // Italic
            else if (match[1].startsWith('*')) {
                parts.push(<em key={match.index}>{match[5]}</em>);
            }
            // Underline
            else if (match[1].startsWith('__')) {
                parts.push(<u key={match.index}>{match[6]}</u>);
            }

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts.length > 0 ? parts : text;
    };

    if (!onEdit) return <Component className={className}>{renderRichText(value)}</Component>;

    return (
        <Component
            onClick={(e) => {
                e.stopPropagation();
                onEdit(path, value, isList);
            }}
            className={cn(
                "hover:bg-blue-50/50 hover:outline hover:outline-1 hover:outline-blue-200 cursor-text transition-all rounded-[1px] px-[1px] -mx-[1px]",
                !value && "text-gray-300 italic",
                className
            )}
        >
            {value ? renderRichText(value) : placeholder}
        </Component>
    );
};

// Helper for List Item Controls
const ListItemControls = ({ path, index, onDelete }) => {
    return (
        <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 print:hidden">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(path, index);
                }}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
                title="Delete Item"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
};

// Helper for Adding New Sub-items
const AddButton = ({ onClick, label }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1 text-[10pt] text-blue-500/50 hover:text-blue-600 font-medium py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-all print:hidden"
    >
        <PlusCircle className="w-3 h-3" />
        {label}
    </button>
);

export function JVTemplate({ data, onEdit, onAdd, onDelete }) {
    if (!data) return null;

    const { personal, meta } = data;
    const sectionOrder = meta?.sectionOrder || ['summary', 'education', 'experience', 'internships', 'projects', 'hackathons', 'skills', 'achievements', 'certifications', 'awards', 'volunteering'];

    const renderSummary = () => {
        if (!data.summary && !onEdit) return null;
        if (!data.summary && onEdit) return null;
        if (!data.summary) return null;

        return (
            <div key="summary" id="summary" className="mb-4 relative group scroll-mt-24">
                <div className="border-b border-black mb-1 pb-[2px]">
                    <h2 className="uppercase font-bold tracking-wide text-[12pt]">Profile Summary</h2>
                </div>
                <div className="text-justify">
                    <Field path="summary" value={data.summary} placeholder="Brief profile summary..." onEdit={onEdit} />
                </div>
            </div>
        );
    };

    const renderEducation = () => {
        const items = data.education || [];
        if (items.length === 0 && !onEdit) return null;
        return (
            <div key="education" id="education" className="mb-4 relative group scroll-mt-24">
                <div className="border-b border-black mb-1 pb-[2px] flex justify-between items-end">
                    <h2 className="uppercase font-bold tracking-wide text-[12pt]">Education</h2>
                    {onAdd && <AddButton onClick={() => onAdd('education', { school: 'University', degree: 'Degree', location: 'Location', dates: 'Dates' })} label="Add Education" />}
                </div>
                <div>
                    {items.map((edu, i) => (
                        <div key={i} className="mb-1 relative group pl-0">
                            <ListItemControls path="education" index={i} onDelete={onDelete} />
                            <div className="flex justify-between font-bold">
                                <Field path={`education.${i}.school`} value={edu.school} placeholder="School Name" onEdit={onEdit} />
                                <Field path={`education.${i}.location`} value={edu.location} placeholder="Location" font="normal" onEdit={onEdit} />
                            </div>
                            <div className="flex justify-between italic text-[11pt]">
                                <Field path={`education.${i}.degree`} value={edu.degree} placeholder="Degree" onEdit={onEdit} />
                                <Field path={`education.${i}.dates`} value={edu.dates} placeholder="Dates" onEdit={onEdit} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderExperience = (id = 'experience', title = 'Experience', label = 'Add Experience') => {
        const items = data[id] || [];
        if (items.length === 0 && !onEdit) return null;
        return (
            <div key={id} id={id} className="mb-4 relative group scroll-mt-24">
                <div className="border-b border-black mb-1 pb-[2px] flex justify-between items-end">
                    <h2 className="uppercase font-bold tracking-wide text-[12pt]">{title}</h2>
                    {onAdd && <AddButton onClick={() => onAdd(id, { company: 'Company', role: 'Role', dates: 'Dates', location: 'Location', description: [''] })} label={label} />}
                </div>
                <div>
                    {items.map((exp, i) => (
                        <div key={i} className="mb-3 relative group">
                            <ListItemControls path={id} index={i} onDelete={onDelete} />
                            <div className="flex justify-between">
                                <span className="font-bold">
                                    <Field path={`${id}.${i}.company`} value={exp.company} placeholder="Company" onEdit={onEdit} />
                                </span>
                                <Field path={`${id}.${i}.dates`} value={exp.dates} placeholder="Dates" onEdit={onEdit} />
                            </div>
                            <div className="flex justify-between italic mb-1">
                                <Field path={`${id}.${i}.role`} value={exp.role} placeholder="Role" onEdit={onEdit} />
                                <Field path={`${id}.${i}.location`} value={exp.location} placeholder="Location" onEdit={onEdit} />
                            </div>
                            <ul className="list-none pl-0 relative">
                                {(Array.isArray(exp.description) ? exp.description : [exp.description]).flat().map((desc, j) => (
                                    <li key={j} className="flex items-start text-justify mb-0.5 relative group/bullet">
                                        <span className="mr-2 text-[10pt]">•</span>
                                        <span className="flex-1">
                                            <Field path={`${id}.${i}.description.${j}`} value={desc} placeholder="Description..." onEdit={onEdit} />
                                        </span>
                                        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(`${id}.${i}.description`, j); }} className="absolute -right-4 top-0 opacity-0 group-hover/bullet:opacity-100 p-0.5 text-red-400 hover:text-red-600 print:hidden"><Trash2 className="w-2.5 h-2.5" /></button>}
                                    </li>
                                ))}
                                {onAdd && <li className="pl-4 pt-1 print:hidden"><button onClick={() => onAdd(`${id}.${i}.description`, "New bullet point")} className="text-[9pt] text-blue-400 hover:text-blue-600 flex items-center gap-1 opacity-50 hover:opacity-100"><Plus className="w-3 h-3" /> Add Bullet</button></li>}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderProjects = (id = 'projects', title = 'Projects', label = 'Add Project', isPub = false) => {
        const items = data[id] || [];
        if (items.length === 0 && !onEdit) return null;
        return (
            <div key={id} id={id} className="mb-4 relative group scroll-mt-24">
                <div className="border-b border-black mb-1 pb-[2px] flex justify-between items-end">
                    <h2 className="uppercase font-bold tracking-wide text-[12pt]">{title}</h2>
                    {onAdd && <AddButton onClick={() => onAdd(id, isPub ? { name: 'Title', venue: 'Venue', authors: 'Authors', dates: 'Year' } : { name: 'Project', dates: 'Dates', description: [''] })} label={label} />}
                </div>
                <div>
                    {items.map((proj, i) => (
                        <div key={i} className="mb-2 relative group">
                            <ListItemControls path={id} index={i} onDelete={onDelete} />

                            {/* Header Line */}
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span>
                                    <span className="font-bold"><Field path={`${id}.${i}.name`} value={proj.name} placeholder={isPub ? "Paper Title" : "Name"} onEdit={onEdit} /></span>
                                    {isPub && proj.venue && <> | <span className="italic"><Field path={`${id}.${i}.venue`} value={proj.venue} placeholder="Venue" onEdit={onEdit} /></span></>}
                                    {proj.url && !isPub && <> | <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-black underline"><span className="text-[11pt]">Link</span></a></>}
                                </span>
                                <Field path={`${id}.${i}.dates`} value={proj.dates} placeholder="Dates" onEdit={onEdit} />
                            </div>

                            {/* Sub-Header (Authors / Org / Role for Research) */}
                            {(isPub || id === 'research') && (
                                <div className="flex justify-between items-baseline mb-0.5 italic text-[11pt]">
                                    <span>
                                        {isPub ? <Field path={`${id}.${i}.authors`} value={proj.authors} placeholder="Authors" onEdit={onEdit} /> :
                                            <><Field path={`${id}.${i}.company`} value={proj.company} placeholder="Institution" onEdit={onEdit} /> -- <Field path={`${id}.${i}.role`} value={proj.role} placeholder="Role" onEdit={onEdit} /></>
                                        }
                                    </span>
                                </div>
                            )}

                            {/* Link for Pubs */}
                            {isPub && proj.url && (
                                <div className="mb-1">
                                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-black underline text-[10pt]"><Field path={`${id}.${i}.url`} value={proj.url} placeholder="Link" onEdit={onEdit} /></a>
                                </div>
                            )}

                            {/* Bullets */}
                            {(!isPub || (proj.description && proj.description.length > 0)) && (
                                <ul className="list-none pl-0">
                                    {(Array.isArray(proj.description) ? proj.description : [proj.description]).flat().filter(Boolean).map((desc, j) => (
                                        <li key={j} className="flex items-start text-justify mb-0.5 relative group/bullet">
                                            <span className="mr-2 text-[10pt]">•</span>
                                            <span className="flex-1">
                                                <Field path={`${id}.${i}.description.${j}`} value={desc} placeholder="Description..." onEdit={onEdit} />
                                            </span>
                                            {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(`${id}.${i}.description`, j); }} className="absolute -right-4 top-0 opacity-0 group-hover/bullet:opacity-100 p-0.5 text-red-400 hover:text-red-600 print:hidden"><Trash2 className="w-2.5 h-2.5" /></button>}
                                        </li>
                                    ))}
                                    {onAdd && !isPub && <li className="pl-4 pt-1 print:hidden"><button onClick={() => onAdd(`${id}.${i}.description`, "New bullet point")} className="text-[9pt] text-blue-400 hover:text-blue-600 flex items-center gap-1 opacity-50 hover:opacity-100"><Plus className="w-3 h-3" /> Add Bullet</button></li>}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSkills = () => {
        const items = data.skills || [];
        if (items.length === 0 && !onEdit) return null;
        return (
            <div key="skills" id="skills" className="mb-4 relative group scroll-mt-24">
                <div className="border-b border-black mb-1 pb-[2px] flex justify-between items-end">
                    <h2 className="uppercase font-bold tracking-wide text-[12pt]">Technical Skills</h2>
                    {onAdd && <AddButton onClick={() => onAdd('skills', { name: "Category", items: ["Skill"] })} label="Add Category" />}
                </div>
                <ul className="list-none pl-0 mt-1">
                    {(Array.isArray(items) ? items : []).map((skill, i) => (
                        <li key={i} className="flex items-start mb-1 relative group/skill">
                            <span className="mr-2 text-[10pt]">•</span>
                            <div className="flex-1">
                                <span className="font-bold">
                                    <Field path={`skills.${i}.name`} value={skill.name} placeholder="Category" onEdit={onEdit} />:
                                </span>
                                <span className="ml-1">
                                    <Field
                                        path={`skills.${i}.items`}
                                        value={Array.isArray(skill.items) ? skill.items.join(', ') : skill.items}
                                        placeholder="List skills..."
                                        isList={true}
                                        onEdit={onEdit}
                                    />
                                </span>
                            </div>
                            {onDelete && <div className="absolute -left-4 top-0 opacity-0 group-hover/skill:opacity-100 p-0.5 print:hidden"><button onClick={() => onDelete('skills', i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-2.5 h-2.5" /></button></div>}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderCertifications = (id = 'certifications', title = 'Certifications') => {
        const items = data[id] || [];
        if (items.length === 0 && !onEdit) return null;
        return (
            <div key={id} id={id} className="mb-4 relative group scroll-mt-24">
                <div className="border-b border-black mb-1 pb-[2px] flex justify-between items-end">
                    <h2 className="uppercase font-bold tracking-wide text-[12pt]">{title}</h2>
                    {onAdd && <AddButton onClick={() => onAdd(id, { name: 'Certificate', organization: 'Org', dates: 'Date' })} label="Add Cert" />}
                </div>
                <div>
                    {items.map((cert, i) => (
                        <div key={i} className="mb-2 relative group">
                            <ListItemControls path={id} index={i} onDelete={onDelete} />
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold"><Field path={`${id}.${i}.name`} value={cert.name} placeholder="Certificate Name" onEdit={onEdit} /></span>
                                <Field path={`${id}.${i}.dates`} value={[cert.dates, cert.expiry].filter(Boolean).join(' -- ')} placeholder="Dates" onEdit={onEdit} />
                            </div>
                            <div className="flex justify-between items-baseline mb-1 italic text-[11pt]">
                                <Field path={`${id}.${i}.organization`} value={cert.organization} placeholder="Issuing Organization" onEdit={onEdit} />
                                {cert.credentialId && <span className="text-[10pt] not-italic">ID: <Field path={`${id}.${i}.credentialId`} value={cert.credentialId} placeholder="ID" onEdit={onEdit} /></span>}
                            </div>
                            <ul className="list-none pl-0">
                                {(Array.isArray(cert.description) ? cert.description : [cert.description || '']).flat().filter(Boolean).map((desc, j) => (
                                    <li key={j} className="flex items-start text-justify mb-0.5 relative group/bullet">
                                        <span className="mr-2 text-[10pt]">•</span>
                                        <span className="flex-1">
                                            <Field path={`${id}.${i}.description.${j}`} value={desc} placeholder="Description..." onEdit={onEdit} />
                                        </span>
                                        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(`${id}.${i}.description`, j); }} className="absolute -right-4 top-0 opacity-0 group-hover/bullet:opacity-100 p-0.5 text-red-400 hover:text-red-600 print:hidden"><Trash2 className="w-2.5 h-2.5" /></button>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderAwards = () => {
        const items = data.awards || [];
        if (items.length === 0 && !onEdit) return null;
        return (
            <div key="awards" id="awards" className="mb-4 relative group scroll-mt-24">
                <div className="border-b border-black mb-1 pb-[2px] flex justify-between items-end">
                    <h2 className="uppercase font-bold tracking-wide text-[12pt]">Honors & Awards</h2>
                    {onAdd && <AddButton onClick={() => onAdd('awards', { name: 'Award', organization: 'Org', dates: 'Date' })} label="Add Award" />}
                </div>
                <div>
                    {items.map((award, i) => (
                        <div key={i} className="mb-2 relative group">
                            <ListItemControls path="awards" index={i} onDelete={onDelete} />
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold"><Field path={`awards.${i}.name`} value={award.name || award.title} placeholder="Award Name" onEdit={onEdit} /></span>
                                <Field path={`awards.${i}.dates`} value={award.dates || award.date} placeholder="Date" onEdit={onEdit} />
                            </div>
                            <div className="italic text-[11pt] mb-1">
                                <Field path={`awards.${i}.organization`} value={award.organization || award.organisation || award.company} placeholder="Organization" onEdit={onEdit} />
                            </div>
                            <ul className="list-none pl-0">
                                {(Array.isArray(award.description) ? award.description : [award.description]).flat().filter(Boolean).map((desc, j) => (
                                    <li key={j} className="flex items-start text-justify mb-0.5 relative group/bullet">
                                        <span className="mr-2 text-[10pt]">•</span>
                                        <span className="flex-1">
                                            <Field path={`awards.${i}.description.${j}`} value={desc} placeholder="Description..." onEdit={onEdit} />
                                        </span>
                                        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(`awards.${i}.description`, j); }} className="absolute -right-4 top-0 opacity-0 group-hover/bullet:opacity-100 p-0.5 text-red-400 hover:text-red-600 print:hidden"><Trash2 className="w-2.5 h-2.5" /></button>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderList = (id, title, label, placeholder = 'Item...') => {
        const items = data[id] || [];
        if (items.length === 0 && !onEdit) return null;
        return (
            <div key={id} id={id} className="mb-4 relative group scroll-mt-24">
                <div className="border-b border-black mb-1 pb-[2px] flex justify-between items-end">
                    <h2 className="uppercase font-bold tracking-wide text-[12pt]">{title}</h2>
                    {onAdd && <AddButton onClick={() => onAdd(id, placeholder)} label={label} />}
                </div>
                <ul className="list-none pl-0 mt-1">
                    {items.map((item, i) => {
                        let val = item;
                        let path = `${id}.${i}`;
                        if (typeof item === 'object' && item !== null) {
                            val = item.description || item.title || item.name || (typeof item.toString === 'function' ? item.toString() : '');
                            if (item.description) path = `${id}.${i}.description`;
                        }
                        return (
                            <li key={i} className="flex items-start text-justify mb-0.5 relative group/bullet">
                                <span className="mr-2 text-[10pt]">•</span>
                                <span className="flex-1">
                                    <Field path={path} value={val} placeholder={placeholder} onEdit={onEdit} />
                                </span>
                                {onDelete && <div className="absolute -left-4 top-0 opacity-0 group-hover/bullet:opacity-100 p-0.5"><button onClick={() => onDelete(id, i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-2.5 h-2.5" /></button></div>}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    return (
        <div
            id="resume-page"
            className="bg-white text-black leading-snug shadow-2xl mx-auto relative group/page"
            style={{
                width: '8.5in',
                minHeight: '11in',
                padding: '0.5in',
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '11pt'
            }}
        >
            {/* Header (Always Top) */}
            <div id="personal" className="text-center mb-4 relative group scroll-mt-24">
                <div className="uppercase tracking-widest mb-1" style={{ fontSize: '24pt', fontWeight: 'bold' }}>
                    <Field path="personal.name" value={personal?.name} placeholder="YOUR NAME" onEdit={onEdit} />
                </div>
                <div className="text-[11pt]">
                    <Field path="personal.phone" value={personal?.phone} placeholder="Phone" onEdit={onEdit} />
                    <> | <Field path="personal.email" value={personal?.email} placeholder="Email" onEdit={onEdit} /></>
                    <> | <a href={personal?.linkedin ? (personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`) : '#'} target="_blank" rel="noopener noreferrer" className="text-black no-underline"><Field path="personal.linkedin" value={personal?.linkedin} placeholder="LinkedIn URL" onEdit={onEdit} /></a></>
                    <> | <a href={personal?.url ? (personal.url.startsWith('http') ? personal.url : `https://${personal.url}`) : '#'} target="_blank" rel="noopener noreferrer" className="text-black no-underline"><Field path="personal.url" value={personal?.url} placeholder="Portfolio URL" onEdit={onEdit} /></a></>
                </div>
            </div>

            {/* Dynamic Sections */}
            {sectionOrder.map(id => {
                switch (id) {
                    case 'summary': return renderSummary();
                    case 'objective':
                        if (!data.objective && !onEdit) return null;
                        return (
                            <div key="objective" id="objective" className="mb-4 relative group scroll-mt-24">
                                <div className="border-b border-black mb-1 pb-[2px]">
                                    <h2 className="uppercase font-bold tracking-wide text-[12pt]">Career Objective</h2>
                                </div>
                                <div className="text-justify">
                                    <Field path="objective" value={data.objective} placeholder="Brief career objective..." onEdit={onEdit} />
                                </div>
                            </div>
                        );

                    case 'education': return renderEducation();
                    case 'experience': return renderExperience('experience', 'Professional Experience', 'Add Experience');
                    case 'leadership': return renderExperience('leadership', 'Leadership', 'Add Leadership Role');
                    case 'internships': return renderExperience('internships', 'Internships', 'Add Internship');
                    case 'volunteering': return renderExperience('volunteering', 'Volunteering', 'Add Volunteering');

                    case 'projects': return renderProjects('projects', 'Projects', 'Add Project');
                    case 'hackathons': return renderProjects('hackathons', 'Hackathons', 'Add Hackathon');
                    case 'research': return renderProjects('research', 'Research', 'Add Research');
                    case 'publications': return renderProjects('publications', 'Publications', 'Add Publication', true);

                    case 'skills': return renderSkills();
                    case 'achievements': return renderList('achievements', 'Achievements', 'Add Achievement', 'Achievement');
                    case 'certifications': return renderCertifications();
                    case 'awards': return renderAwards();
                    default: return null;
                }
            })}
        </div>
    );
}

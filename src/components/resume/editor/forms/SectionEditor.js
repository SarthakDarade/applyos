import React, { useRef, useState } from 'react';
import { Plus, Trash2, GripVertical, Calendar, MapPin, Building, GraduationCap, Link2, Sparkles, Bold, Italic, Underline, Info, X, Check, Loader2 } from 'lucide-react';

const AIOptimizeButton = ({ text, onOptimize, context = 'resume_section' }) => {
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleOptimize = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!text || text.length < 10) {
            setFeedback('Too short');
            setTimeout(() => setFeedback(null), 2000);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/resume/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section_key: context,
                    section_content: text
                })
            });

            if (!response.ok) throw new Error('Failed');

            const result = await response.json();
            if (result.enhanced_content) {
                onOptimize(result.enhanced_content);
                setFeedback('Optimized!');
                setTimeout(() => setFeedback(null), 2000);
            }
        } catch (error) {
            setFeedback('Failed');
            setTimeout(() => setFeedback(null), 2000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleOptimize}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20 hover:border-blue-500/30 rounded-full text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-all uppercase tracking-wider group min-w-[90px] justify-center"
        >
            {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
            )}
            <span>{loading ? 'Working...' : feedback || 'Optimize'}</span>
        </button>
    );
};

const ToolbarButton = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
        title={label}
    >
        <Icon className="w-3.5 h-3.5" />
    </button>
);

const RichTextarea = ({ value, onChange, className, placeholder, ...props }) => {
    const textareaRef = useRef(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const insertFormat = (startTag, endTag) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        const before = text.substring(0, start);
        const after = text.substring(end);

        const newText = `${before}${startTag}${selectedText}${endTag}${after}`;

        // Update value
        onChange(newText);

        // Restore cursor / selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + startTag.length, end + startTag.length);
        }, 0);
    };

    const handleLinkClick = () => {
        setLinkUrl('https://');
        setShowLinkModal(true);
    };

    const confirmLink = () => {
        if (linkUrl) {
            insertFormat("[", `](${linkUrl})`);
        }
        setShowLinkModal(false);
    };

    return (
        <div className="space-y-2 relative">
            <div className="flex items-center gap-1 border-b border-white/5 pb-2 mb-1">
                <ToolbarButton icon={Bold} label="Bold (Cmd+B)" onClick={() => insertFormat('**', '**')} />
                <ToolbarButton icon={Italic} label="Italic (Cmd+I)" onClick={() => insertFormat('*', '*')} />
                <ToolbarButton icon={Underline} label="Underline (Cmd+U)" onClick={() => insertFormat('__', '__')} />
                <div className="w-px h-3 bg-white/10 mx-1" />
                <ToolbarButton icon={Link2} label="Link" onClick={handleLinkClick} />
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="absolute top-10 left-0 z-50 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Link2 className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Add Link</span>
                    </div>
                    <input
                        autoFocus
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white mb-2 focus:border-blue-500/50 outline-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmLink();
                            if (e.key === 'Escape') setShowLinkModal(false);
                        }}
                    />
                    <div className="flex items-center gap-2 justify-end">
                        <button
                            onClick={() => setShowLinkModal(false)}
                            className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmLink}
                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-medium flex items-center gap-1"
                        >
                            <Check className="w-3 h-3" /> Add
                        </button>
                    </div>
                </div>
            )}

            <textarea
                ref={textareaRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={className}
                placeholder={placeholder}
                {...props}
            />
        </div>
    );
};

export function SectionEditor({ section, onChange }) {

    const handleChange = (key, value) => {
        onChange({ ...section, [key]: value });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...(section.items || [])];
        if (!newItems[index]) newItems[index] = {};

        // SAFETY PATCH: If item is a string (legacy/corrupted), convert to object to prevent crash
        if (typeof newItems[index] === 'string') {
            newItems[index] = {
                id: Date.now() + Math.random(),
                name: newItems[index],
                title: newItems[index],
                description: newItems[index]
            };
        }

        newItems[index][field] = value;
        onChange({ ...section, items: newItems });
    };

    const handleAddItem = () => {
        const newItems = [...(section.items || [])];
        if (section.id === 'education') newItems.push({ school: '', degree: '', dates: '', location: '' });
        else if (section.id === 'experience') newItems.push({ company: '', role: '', dates: '', location: '', description: [''] });
        else if (section.id === 'projects') newItems.push({ name: '', dates: '', description: [''] });
        else if (section.id === 'skills') newItems.push({ name: '', items: [] });

        // New Sections
        else if (section.id === 'research') newItems.push({ name: '', company: '', role: '', dates: '', description: [''] });
        else if (section.id === 'publications') newItems.push({ name: '', authors: '', venue: '', dates: '', url: '' });
        else if (section.id === 'awards') newItems.push({ name: '', organization: '', dates: '', description: '' });
        else if (section.id === 'certifications') newItems.push({ name: '', organization: '', dates: '', expiry: '', credentialId: '' });

        else newItems.push({}); // Generic
        onChange({ ...section, items: newItems });
    };

    const handleDeleteItem = (index) => {
        const newItems = section.items.filter((_, i) => i !== index);
        onChange({ ...section, items: newItems });
    };

    // --- Specific Editors ---

    if (section.id === 'summary' || section.id === 'objective') {
        const isObj = section.id === 'objective';
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Content</span>
                    <AIOptimizeButton
                        text={section.content || ''}
                        onOptimize={(val) => handleChange('content', val)}
                        context={isObj ? 'career_objective' : 'professional_summary'}
                    />
                </div>
                <div className="bg-neutral-900 border border-neutral-800 focus-within:border-neutral-700 rounded-xl p-4 transition-all">
                    <RichTextarea
                        value={section.content || ''}
                        onChange={val => handleChange('content', val)}
                        className="w-full h-80 bg-transparent border-none focus:ring-0 p-0 text-base text-neutral-200 placeholder-neutral-600 resize-none leading-relaxed"
                        placeholder={isObj ? "Briefly describe your career goals..." : "Briefly describe your professional background..."}
                    />
                </div>
            </div>
        );
    }

    if (section.id === 'skills') {
        return (
            <div className="space-y-6">
                {(section.items || []).map((item, index) => (
                    <div key={index} className="bg-neutral-900/40 border border-neutral-800/50 hover:border-neutral-700 rounded-xl p-5 space-y-4 relative group transition-all">
                        <button
                            onClick={() => handleDeleteItem(index)}
                            className="absolute right-3 top-3 p-2 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-neutral-800"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">Category Name</label>
                            <input
                                value={item.name || ''}
                                onChange={e => handleItemChange(index, 'name', e.target.value)}
                                className="w-full bg-transparent border-b border-neutral-800 focus:border-neutral-500 py-2 text-base text-neutral-200 outline-none placeholder-neutral-700 transition-all"
                                placeholder="e.g. Languages"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">Skills List</label>
                                <span className="text-[10px] text-neutral-600">Comma separated</span>
                            </div>
                            <input
                                value={Array.isArray(item.items) ? item.items.join(', ') : (item.items || '')}
                                onChange={e => handleItemChange(index, 'items', e.target.value.split(','))}
                                className="w-full bg-transparent border-b border-neutral-800 focus:border-neutral-500 py-2 text-base text-neutral-200 outline-none placeholder-neutral-700 transition-all"
                                placeholder="Java, Python, C++..."
                            />
                        </div>
                    </div>
                ))}
                <button
                    onClick={handleAddItem}
                    className="w-full py-4 rounded-xl border border-dashed border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700 text-sm text-neutral-500 hover:text-neutral-300 transition-all flex items-center justify-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>
        )
    }

    // Simple List Editor (Achievements Only now)
    if (['achievements'].includes(section.id)) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-end">
                    {/* Removed global optimize button */}
                </div>
                {(section.items || []).map((item, index) => {
                    const value = typeof item === 'string' ? item : (item.description || item.title || '');
                    return (
                        <div key={index} className="flex items-start gap-3 group">
                            <span className="text-neutral-600 mt-14">•</span>
                            <div className="flex-1 bg-neutral-900 border border-neutral-800 focus-within:border-neutral-700 rounded-xl p-4 transition-all shadow-sm relative">
                                <div className="absolute right-2 top-2 z-10">
                                    <AIOptimizeButton
                                        text={value}
                                        onOptimize={(val) => {
                                            const newItems = [...(section.items || [])];
                                            if (typeof newItems[index] === 'object' && newItems[index] !== null) {
                                                newItems[index] = { ...newItems[index], description: val };
                                            } else {
                                                newItems[index] = val;
                                            }
                                            handleChange('items', newItems);
                                        }}
                                        context={`${section.id}_item`}
                                    />
                                </div>
                                <RichTextarea
                                    value={value}
                                    onChange={val => {
                                        const newItems = [...(section.items || [])];
                                        if (typeof newItems[index] === 'object' && newItems[index] !== null) {
                                            newItems[index] = { ...newItems[index], description: val };
                                        } else {
                                            newItems[index] = val;
                                        }
                                        handleChange('items', newItems);
                                    }}
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-base text-neutral-200 placeholder-neutral-600 resize-none h-24 leading-relaxed mt-4"
                                    placeholder={`Describe your ${section.id.slice(0, -1)}...`}
                                />
                            </div>
                            <button
                                onClick={() => handleDeleteItem(index)}
                                className="p-2 mt-2 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-neutral-800"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
                <button
                    onClick={() => {
                        const newItems = [...(section.items || []), { description: '' }];
                        handleChange('items', newItems);
                    }}
                    className="w-full py-4 rounded-xl border border-dashed border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700 text-sm text-neutral-500 hover:text-neutral-300 transition-all flex items-center justify-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </div>
        );
    }

    // Comprehensive Editor (Experience, Education, Projects, Research, Publications, Awards, Certifications)
    const isProject = ['projects', 'hackathons', 'research', 'publications'].includes(section.id);
    const isEducation = section.id === 'education';
    const isResearch = section.id === 'research';
    const isPublications = section.id === 'publications';
    const isAwards = section.id === 'awards';
    const isCertifications = section.id === 'certifications';

    return (
        <div className="space-y-6">
            {(section.items || []).map((item, index) => (
                <div key={index} className="bg-neutral-900/40 border border-neutral-800/50 hover:border-neutral-700 rounded-xl p-6 space-y-6 relative group transition-all">
                    <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleDeleteItem(index)}
                            className="p-2 text-neutral-600 hover:text-red-400 transition-colors rounded-lg hover:bg-neutral-800"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* --- TITLE / NAME / AWARD --- */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">
                                {isEducation ? 'School / University' :
                                    isPublications ? 'Paper Title' :
                                        isAwards ? 'Award Name' :
                                            isCertifications ? 'Certification Name' :
                                                isResearch ? 'Research Title' :
                                                    isProject ? 'Project / Event Name' :
                                                        'Company / Organization'}
                            </label>
                            <div className="relative group">
                                {isEducation || isCertifications ? <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors" /> :
                                    isAwards ? <Sparkles className="w-4 h-4 absolute left-3 top-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors" /> :
                                        <Building className="w-4 h-4 absolute left-3 top-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />}
                                <input
                                    value={(isEducation ? item.school : (isProject || isAwards || isCertifications) ? item.name : item.company) || ''}
                                    onChange={e => handleItemChange(index, isEducation ? 'school' : (isProject || isAwards || isCertifications) ? 'name' : 'company', e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 pl-10 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                    placeholder={
                                        isEducation ? 'Harvard University' :
                                            isResearch ? 'AI Ethics Study' :
                                                isPublications ? 'Deep Learning in 2025' :
                                                    isAwards ? 'Employee of the Month' :
                                                        isCertifications ? 'AWS Solutions Architect' :
                                                            isProject ? 'Portfolio Website' :
                                                                'Google'
                                    }
                                />
                            </div>
                        </div>

                        {/* --- DATES / EXPIRY --- */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">
                                {isPublications ? 'Date Published' :
                                    isAwards ? 'Date Received' :
                                        isCertifications ? 'Date Obtained' :
                                            'Dates'}
                            </label>
                            <div className="relative group">
                                <Calendar className="w-4 h-4 absolute left-3 top-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    value={item.dates || ''}
                                    onChange={e => handleItemChange(index, 'dates', e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 pl-10 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                    placeholder={isResearch ? "Format: 'Start - End' or 'Start - Present'" : "Jan 2023 - Present"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- ROW 2 VARIANTS --- */}

                    {/* ORGANIZATIONS / ROLES */}
                    {(isResearch || isAwards || isCertifications) && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">
                                    {isResearch ? 'Institution' : 'Organization'}
                                </label>
                                <div className="relative group">
                                    <Building className="w-4 h-4 absolute left-3 top-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        value={item.company || item.organization || ''}
                                        onChange={e => handleItemChange(index, isResearch ? 'company' : 'organization', e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 pl-10 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                        placeholder={isResearch ? 'University of Tech' : 'Org Name'}
                                    />
                                </div>
                            </div>

                            {isResearch && (
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">Role</label>
                                    <input
                                        value={item.role || ''}
                                        onChange={e => handleItemChange(index, 'role', e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                        placeholder="Research Assistant"
                                    />
                                </div>
                            )}

                            {isCertifications && (
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">Expiration Date (Opt)</label>
                                    <input
                                        value={item.expiry || ''}
                                        onChange={e => handleItemChange(index, 'expiry', e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                        placeholder="e.g. Dec 2026"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* PUBLICATIONS SPECIFIC */}
                    {isPublications && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">Authors</label>
                                <input
                                    value={item.authors || ''}
                                    onChange={e => handleItemChange(index, 'authors', e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                    placeholder="J. Doe, A. Smith..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">Publication Venue</label>
                                <input
                                    value={item.venue || ''}
                                    onChange={e => handleItemChange(index, 'venue', e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                    placeholder="IEEE Conference 2024"
                                />
                            </div>
                        </div>
                    )}

                    {/* LINKS / IDS / LOCATION */}
                    <div className="grid grid-cols-2 gap-6">
                        {(isProject || isPublications) && (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">
                                    {isPublications ? 'Link / DOI (Optional)' : 'Project Link (Optional)'}
                                </label>
                                <div className="relative group">
                                    <Link2 className="w-4 h-4 absolute left-3 top-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        value={item.url || ''}
                                        onChange={e => handleItemChange(index, 'url', e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 pl-10 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        )}

                        {isCertifications && (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">Credential ID (Optional)</label>
                                <input
                                    value={item.credentialId || ''}
                                    onChange={e => handleItemChange(index, 'credentialId', e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                />
                            </div>
                        )}

                        {(!isProject && !isAwards && !isCertifications) && (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">Location</label>
                                <div className="relative group">
                                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        value={item.location || ''}
                                        onChange={e => handleItemChange(index, 'location', e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 pl-10 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                        placeholder="San Francisco, CA"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Standard Role (Experience/Education) */}
                        {(!isProject && !isEducation && !isResearch && !isCertifications && !isAwards) && (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">Role / Title</label>
                                <input
                                    value={item.role || ''}
                                    onChange={e => handleItemChange(index, 'role', e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                    placeholder="Software Engineer"
                                />
                            </div>
                        )}
                        {isEducation && (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">Degree</label>
                                <input
                                    value={item.degree || ''}
                                    onChange={e => handleItemChange(index, 'degree', e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-neutral-700"
                                    placeholder="B.S. Computer Science"
                                />
                            </div>
                        )}
                    </div>


                    {/* BULLETS / DESCRIPTION */}
                    {!isEducation && !isPublications && (
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest pl-1">
                                    {isAwards ? 'Description (Optional)' : 'Description / Bullets'}
                                </label>
                            </div>

                            {/* Handle simple string description for Awards, array for others */}
                            {(isAwards ? [item.description || ''] : (Array.isArray(item.description) ? item.description : [item.description || ''])).map((bullet, bIdx) => (
                                <div key={bIdx} className="flex items-start gap-3 group/bullet">
                                    <span className="text-neutral-600 mt-12 group-hover/bullet:text-blue-500 transition-colors">•</span>
                                    <div className="flex-1 bg-neutral-950 border border-neutral-800 focus-within:border-blue-500/50 rounded-lg p-3 transition-all relative">
                                        <div className="absolute right-2 top-2 z-10">
                                            <AIOptimizeButton
                                                text={bullet}
                                                onOptimize={(val) => {
                                                    if (isAwards) {
                                                        handleItemChange(index, 'description', val);
                                                    } else {
                                                        const newDesc = [...(Array.isArray(item.description) ? item.description : [item.description])];
                                                        newDesc[bIdx] = val;
                                                        handleItemChange(index, 'description', newDesc);
                                                    }
                                                }}
                                                context={`${section.id}_bullet`}
                                            />
                                        </div>
                                        <RichTextarea
                                            value={bullet}
                                            onChange={val => {
                                                if (isAwards) {
                                                    handleItemChange(index, 'description', val);
                                                } else {
                                                    const newDesc = [...(Array.isArray(item.description) ? item.description : [item.description])];
                                                    newDesc[bIdx] = val;
                                                    handleItemChange(index, 'description', newDesc);
                                                }
                                            }}
                                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-neutral-200 resize-none h-20 leading-relaxed scrollbar-thin scrollbar-thumb-white/10 placeholder-neutral-700 mt-6"
                                            placeholder="Details..."
                                        />
                                    </div>
                                    {!isAwards && (
                                        <button
                                            onClick={() => {
                                                const newDesc = (Array.isArray(item.description) ? item.description : [item.description]).filter((_, i) => i !== bIdx);
                                                handleItemChange(index, 'description', newDesc);
                                            }}
                                            className="text-neutral-700 hover:text-red-400 mt-3 p-1 rounded hover:bg-neutral-800 transition-colors opacity-0 group-hover/bullet:opacity-100"
                                            tabIndex={-1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {!isAwards && (
                                <button
                                    onClick={() => {
                                        const newDesc = [...(Array.isArray(item.description) ? item.description : [item.description || '']), ''];
                                        handleItemChange(index, 'description', newDesc);
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-blue-500/10 transition-colors ml-4"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Bullet
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
            <button
                onClick={handleAddItem}
                className="w-full py-4 rounded-xl border border-dashed border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700 text-sm text-neutral-500 hover:text-neutral-300 transition-all flex items-center justify-center gap-2 font-medium"
            >
                <Plus className="w-4 h-4" /> Add {section.label ? section.label.slice(0, -1) : 'Item'}
            </button>
        </div>
    );
}

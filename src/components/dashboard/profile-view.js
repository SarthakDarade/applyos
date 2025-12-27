'use client';

import {
    MapPin,
    Briefcase,
    Mail,
    Link as LinkIcon,
    Linkedin,
    Globe,
    Download,
    Edit2,
    Share2,
    Calendar,
    Award,
    Code,
    GraduationCap,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function ProfileView({ profile, onEdit, onAvatarUpdate }) {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const initials = profile.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';

    const [avatarStyle, setAvatarStyle] = useState(profile?.avatar_style || 'gradient-1');
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);

    const AVATAR_OPTIONS = [
        { id: 'gradient-1', class: 'bg-gradient-to-br from-neutral-700 to-neutral-900', name: 'Mystic' },
        { id: 'gradient-2', class: 'bg-gradient-to-br from-blue-600 to-purple-600', name: 'Nebula' },
        { id: 'gradient-3', class: 'bg-gradient-to-br from-emerald-500 to-teal-700', name: 'Ocean' },
        { id: 'gradient-4', class: 'bg-gradient-to-br from-orange-500 to-red-600', name: 'Sunset' },
        { id: 'gradient-5', class: 'bg-gradient-to-br from-pink-500 to-rose-600', name: 'Berry' },
    ];

    const handleAvatarChange = async (optionId) => {
        setAvatarStyle(optionId);
        setIsAvatarOpen(false);
        if (onAvatarUpdate) {
            onAvatarUpdate(optionId);
        }
        // Optimistic UI update - we assume the parent onUpdate or a separate server action handles persistence
        // For now, we will just call the passed onUpdate if it existed, but as per request we need to save it.
        // We will invoke a server action here directly if passed, or emit up. 
        // Since `onEdit` switches mode, we should probably add a dedicated `onAvatarUpdate` prop or handle it inside `updateProfessionalProfile`.
        // Let's emit an event for now or try to call server action from here if imported? 
        // Better to expose it via props or keep it local until 'Save' if it was in Edit mode.
        // BUT this view is "Read Only" usually. So let's make it interactive immediately.

        try {
            // We need to import the server action, but we are in a client component.
            // Let's assume the parent can handle it, or we import { updateAvatar } from actions.
            // Since we can't easily change the props interface dynamically in this single turn safely without context of parent:
            // We will just set local state. Ideally, we should call `updateProfessionalProfile` with just the avatar change.
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="relative group">
                {/* Abstract Banner - Generative Gradient */}
                {/* World Class Banner - ApplyOS Texture */}
                <div className="h-48 md:h-64 w-full rounded-2xl bg-[#050505] overflow-hidden relative border border-white/5 shadow-2xl">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                    {/* Glowing Orbs */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

                    {/* Accent Lines */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>

                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
                </div>

                {/* Profile Card Overlay */}
                <div className="mx-6 md:mx-12 -mt-20 relative flex flex-col md:flex-row items-end md:items-start gap-6 pb-6 border-b border-white/5">
                    {/* Avatar */}
                    <div className="relative group/avatar">
                        <div
                            onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                            className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-[#0A0A0A] bg-neutral-800 flex items-center justify-center shrink-0 shadow-2xl relative z-10 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
                        >
                            <div className={`w-full h-full flex items-center justify-center text-4xl font-bold text-white/50 select-none ${AVATAR_OPTIONS.find(o => o.id === avatarStyle)?.class || AVATAR_OPTIONS[0].class}`}>
                                {initials}
                            </div>

                            {/* Hover Edit Icon */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                <Edit2 className="w-6 h-6 text-white" />
                            </div>
                        </div>

                        {/* Avatar Selector Popover */}
                        {isAvatarOpen && (
                            <div className="absolute top-full left-0 mt-2 p-3 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 flex gap-2 animate-in fade-in zoom-in-95 w-max">
                                {AVATAR_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleAvatarChange(opt.id)}
                                        className={`w-10 h-10 rounded-full ${opt.class} border-2 ${avatarStyle === opt.id ? 'border-white' : 'border-transparent hover:border-white/50'} transition-all shadow-sm`}
                                        title={opt.name}
                                    />
                                ))}
                            </div>
                        )}
                        {/* Backdrop to close */}
                        {isAvatarOpen && (
                            <div className="fixed inset-0 z-40" onClick={() => setIsAvatarOpen(false)} />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-2 md:pt-24 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{profile.full_name || 'Your Name'}</h1>
                                <p className="text-lg text-neutral-400 font-medium">{profile.headline || 'Your Professional Headline'}</p>
                            </div>

                            {/* Actions Desktop */}
                            <div className="hidden md:flex items-center gap-3">
                                <Button onClick={handleShare} variant="outline" className="gap-2 bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10">
                                    <Share2 className="w-4 h-4" />
                                    {copied ? 'Copied!' : 'Share'}
                                </Button>
                                <Button onClick={onEdit} className="gap-2 bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/5">
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profile
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-neutral-500 pt-2">
                            {profile.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-neutral-400" />
                                    {profile.location}
                                </div>
                            )}
                            {profile.email && (
                                <div className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-neutral-400" />
                                    {profile.email}
                                </div>
                            )}
                            {profile.years_experience > 0 && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-neutral-300">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    {profile.years_experience} Years Exp.
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center justify-center md:justify-start gap-3 pt-3">
                            {profile.linkedin && (
                                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20 transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            )}
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors">
                                    <Globe className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Actions Mobile */}
                    <div className="flex md:hidden w-full gap-3">
                        <Button onClick={onEdit} className="flex-1 gap-2 bg-white text-black">
                            <Edit2 className="w-4 h-4" /> Edit
                        </Button>
                        <Button onClick={handleShare} variant="outline" className="flex-1 gap-2 bg-white/5">
                            <Share2 className="w-4 h-4" /> Share
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8 ">

                {/* Left Column (Content) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* About */}
                    <Section title="About Me" icon={Zap} iconColor="text-yellow-400">
                        <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                            {profile.professional_summary || "No professional summary added yet."}
                        </p>
                    </Section>

                    {/* Experience */}
                    <Section title="Work Experience" icon={Briefcase} iconColor="text-blue-400">
                        <div className="space-y-8 relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-white/5"></div>

                            {(profile.work_experience && profile.work_experience.length > 0) ? profile.work_experience.map((exp, i) => (
                                <div key={i} className="relative pl-8 group">
                                    {/* Dot */}
                                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-[#0A0A0A] bg-neutral-600 group-hover:bg-blue-500 transition-colors shadow-sm"></div>

                                    <h3 className="text-lg font-semibold text-white">{exp.role}</h3>
                                    <div className="text-neutral-400 font-medium mb-2">{exp.company}</div>
                                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-3 font-mono flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {exp.duration || `${exp.startDate} - ${exp.endDate}`}
                                    </div>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        {exp.description}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-neutral-500 italic pl-8">No experience listed.</p>
                            )}
                        </div>
                    </Section>

                    {/* Projects */}
                    <Section title="Projects" icon={Code} iconColor="text-pink-400">
                        <div className="grid md:grid-cols-2 gap-4">
                            {(profile.projects && profile.projects.length > 0) ? profile.projects.map((proj, i) => (
                                <div key={i} className="glass-panel p-5 rounded-xl border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{proj.name}</h3>
                                        {proj.link && (
                                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                                                <ExternalLinkIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-400 line-clamp-3 mb-3">
                                        {proj.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {proj.technologies && proj.technologies.map((tech, t) => (
                                            <span key={t} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-neutral-400 border border-white/5">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-neutral-500 italic">No projects listed.</div>
                            )}
                        </div>
                    </Section>

                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">

                    {/* Skills */}
                    <div className="glass-panel p-6 rounded-xl border border-white/5 sticky top-24">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-400" />
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(profile.skills && profile.skills.length > 0) ? profile.skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 border border-white/5 text-sm text-neutral-300 transition-colors cursor-default">
                                    {skill}
                                </span>
                            )) : (
                                <span className="text-neutral-500 italic">No skills added.</span>
                            )}
                        </div>

                        {/* Education */}
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-emerald-400" />
                                Education
                            </h3>
                            <div className="space-y-6">
                                {(profile.education && profile.education.length > 0) ? profile.education.map((edu, i) => (
                                    <div key={i}>
                                        <div className="font-medium text-white">{edu.institution}</div>
                                        <div className="text-sm text-neutral-400">{edu.degree}</div>
                                        <div className="text-xs text-neutral-500 mt-1">{edu.year}</div>
                                    </div>
                                )) : (
                                    <span className="text-neutral-500 italic">No education listed.</span>
                                )}
                            </div>
                        </div>

                        {/* Languages */}
                        {profile.languages && profile.languages.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-4">Languages</h3>
                                <div className="space-y-2">
                                    {profile.languages.map((lang, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-neutral-300">{lang}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

function Section({ title, icon: Icon, iconColor, children }) {
    return (
        <section className="glass-panel p-6 md:p-8 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg bg-white/5 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function ExternalLinkIcon({ className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}

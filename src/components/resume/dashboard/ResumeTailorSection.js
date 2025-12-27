'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, ArrowRight, Check, Wand2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { createClient } from '@/lib/supabase/client';
import { transformToSectionFormat } from '@/lib/resume/structure';

export function ResumeTailorSection({ resumes }) {
    const router = useRouter();
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!selectedResumeId) {
            toast.error("Please select a base resume");
            return;
        }
        if (!jobDescription.trim()) {
            toast.error("Please enter a job description");
            return;
        }

        setIsGenerating(true);
        const supabase = createClient();

        try {
            // 1. Get Source Resume Data
            const sourceResume = resumes.find(r => r.id === selectedResumeId);
            if (!sourceResume || !sourceResume.data) {
                throw new Error("Source resume data not found");
            }

            // 2. Call Tailoring API
            const response = await fetch('/api/resume/tailor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume_data: sourceResume.data,
                    job_requirements: jobDescription,
                    job_title: "Target Role", // Could extract from JD if we had an extractor
                    company_name: "Target Company"
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Tailoring failed");
            }

            const { decision_map } = await response.json();

            if (!decision_map) {
                throw new Error("No suggestion map received");
            }

            // 3. Apply Tailoring Logic
            // CRITICAL FIX: Ensure we are working with the correct Section Format
            let newData = transformToSectionFormat(JSON.parse(JSON.stringify(sourceResume.data)));

            // SAFETY NET: Normalize ALL items in ALL sections to Objects
            // This prevents "Cannot create property on string" errors in the Editor if the base resume had legacy string items.
            if (Array.isArray(newData.sections)) {
                newData.sections.forEach(section => {
                    if (Array.isArray(section.items)) {
                        section.items = section.items.map(item => {
                            if (typeof item === 'string') {
                                return {
                                    id: Date.now() + Math.random(),
                                    title: item,       // Heuristic: string usually maps to title or description
                                    description: item,
                                    enabled: true
                                };
                            }
                            return item;
                        });
                    }
                });
            }

            // A. Update Summary (Only if new variant provided)
            if (decision_map.summary_variant && decision_map.summary_variant.trim().length > 0) {
                const summarySection = newData.sections.find(s => s.id === 'summary');
                if (summarySection) {
                    summarySection.content = decision_map.summary_variant;
                    summarySection.enabled = true; // Ensure it's visible
                }
            }

            // NEW: Structured Tailoring Logic (Preferred)
            if (decision_map.structured_tailoring) {
                const tailoring = decision_map.structured_tailoring;

                // 1. Summary
                if (tailoring.summary) {
                    const summarySection = newData.sections.find(s => s.id === 'summary');
                    if (summarySection) {
                        summarySection.content = tailoring.summary;
                        summarySection.enabled = true;
                    }
                }

                // 2. Career Objective
                if (tailoring.career_objective) {
                    const objContent = Array.isArray(tailoring.career_objective) ? tailoring.career_objective.join('\n') : tailoring.career_objective;
                    let objSection = newData.sections.find(s => s.id === 'objective');
                    if (!objSection) {
                        objSection = { id: 'objective', content: '', enabled: true, items: [] };
                        newData.sections.push(objSection);
                    }
                    objSection.content = objContent;
                    objSection.enabled = true;
                }

                // 3. Experience
                if (Array.isArray(tailoring.experience)) {
                    const expSection = newData.sections.find(s => s.id === 'experience');
                    if (expSection) {
                        if (!expSection.items) expSection.items = [];

                        tailoring.experience.forEach(tItem => {
                            // Find match by Role or Company (fuzzy)
                            const matchIndex = expSection.items.findIndex(existing =>
                                (existing.role && tItem.role && existing.role.toLowerCase().includes(tItem.role.toLowerCase().split(' ')[0])) ||
                                (existing.company && tItem.company && existing.company.toLowerCase().includes(tItem.company.toLowerCase().split(' ')[0]))
                            );

                            const newDesc = tItem.tailored_bullets || tItem.description || [];

                            if (matchIndex !== -1) {
                                // Update Existing
                                expSection.items[matchIndex] = {
                                    ...expSection.items[matchIndex],
                                    description: newDesc,
                                    // Optional: Update role/company if tailoring suggests refinement? 
                                    // Let's trust tailoring for now but keep IDs
                                    role: tItem.role || expSection.items[matchIndex].role,
                                    company: tItem.company || expSection.items[matchIndex].company
                                };
                            } else {
                                // Add New
                                expSection.items.push({
                                    id: Date.now() + Math.random(),
                                    role: tItem.role || 'Role',
                                    company: tItem.company || 'Company',
                                    dates: tItem.dates || '',
                                    location: tItem.location || '',
                                    description: newDesc,
                                    enabled: true
                                });
                            }
                        });
                        expSection.enabled = true;
                    }
                }

                // 4. Projects
                if (Array.isArray(tailoring.projects)) {
                    const projSection = newData.sections.find(s => s.id === 'projects');
                    if (projSection) {
                        if (!projSection.items) projSection.items = [];

                        tailoring.projects.forEach(tItem => {
                            // Match by name
                            const matchIndex = projSection.items.findIndex(existing =>
                                existing.name && tItem.name && existing.name.toLowerCase().includes(tItem.name.toLowerCase().split(' ')[0])
                            );

                            const newDesc = tItem.tailored_description ? [tItem.tailored_description] : (tItem.description || []);

                            if (matchIndex !== -1) {
                                projSection.items[matchIndex] = {
                                    ...projSection.items[matchIndex],
                                    name: tItem.name || projSection.items[matchIndex].name,
                                    description: newDesc
                                };
                            } else {
                                projSection.items.push({
                                    id: Date.now() + Math.random(),
                                    name: tItem.name || 'Project',
                                    dates: '',
                                    description: newDesc,
                                    enabled: true
                                });
                            }
                        });
                        projSection.enabled = true;
                    }
                }

                // 5. Achievements
                if (Array.isArray(tailoring.achievements)) {
                    const achSection = newData.sections.find(s => s.id === 'achievements');
                    if (achSection) {
                        // achievements is simple list of strings in resume (usually)
                        // but our Editor expects objects? 
                        // My safety patch (Step 4527) converts Strings to Objects.
                        // So we can just push Strings or Objects.
                        // However, tailored output is Array of Strings.
                        achSection.items = tailoring.achievements.map(str => ({
                            id: Date.now() + Math.random(),
                            description: str,
                            title: str, // Fallback
                            name: str, // Fallback
                            enabled: true
                        }));
                        achSection.enabled = true;
                    }
                }

                // 6. Skills
                if (Array.isArray(tailoring.skills)) {
                    const skillsSection = newData.sections.find(s => s.id === 'skills');
                    if (skillsSection) {
                        // Tailoring format: { "Category Name": "...", "SKills": [...] }
                        skillsSection.items = tailoring.skills.map(cat => ({
                            id: Date.now() + Math.random(),
                            name: cat["Category Name"] || "Skills",
                            items: cat["SKills"] || [],
                            enabled: true
                        }));
                        skillsSection.enabled = true;
                    }
                }
            } else if (decision_map.prioritized_bullets && Object.keys(decision_map.prioritized_bullets).length > 0) {
                // Legacy Logic Fallback
                Object.entries(decision_map.prioritized_bullets).forEach(([key, updateData]) => {
                    // key format: "experience.0" (Notice: removed .field)
                    const parts = key.split('.');
                    if (parts.length === 2) {
                        const [sectionId, indexStr] = parts;
                        const index = parseInt(indexStr);

                        // Find the correct section
                        const targetSection = newData.sections.find(s => s.id === sectionId);

                        if (targetSection && Array.isArray(targetSection.items)) {
                            // Prepare standardized Description
                            // CRITICAL CHANGE: Pass Array directly for Bullet Points!
                            // The renderers should handle the array as a list.
                            let newDescription = null;
                            const rawDesc = updateData.description;

                            if (Array.isArray(rawDesc) && rawDesc.length > 0) {
                                newDescription = rawDesc; // Pass the array directly
                            } else if (typeof rawDesc === 'string' && rawDesc.trim().length > 0) {
                                // If string, wrap in array or keep string depending on consistency.
                                // Let's try to normalize to Array for "Bullets" feature
                                newDescription = [rawDesc];
                            }

                            // Prepare Update Object
                            const updates = {};
                            if (newDescription) updates.description = newDescription;
                            if (updateData.role) updates.role = updateData.role; // Experience
                            if (updateData.company) updates.company = updateData.company; // Experience
                            if (updateData.title) updates.title = updateData.title; // Projects

                            // Update Existing OR Create New
                            if (targetSection.items[index]) {
                                // Update Existing
                                const currentItem = targetSection.items[index];

                                if (typeof currentItem === 'string') {
                                    // Handle legacy string items (e.g. simple skills/achievements)
                                    // Convert to object structure standard
                                    targetSection.items[index] = {
                                        id: Date.now() + Math.random(),
                                        description: updates.description || currentItem, // Use new desc or keep old string as desc
                                        ...updates
                                    };
                                } else {
                                    // Handle standard object items
                                    targetSection.items[index] = {
                                        ...currentItem,
                                        ...updates
                                    };
                                }
                            } else {
                                // Create New Item (Fill defaults to prevent UI errors)
                                const newItem = {
                                    id: Date.now() + Math.random(), // Temp ID
                                    enabled: true,
                                    date: '',
                                    location: '',
                                    ...updates
                                };
                                // Ensure strict array sizing (fill gaps if jumping index)
                                while (targetSection.items.length < index) {
                                    targetSection.items.push({ id: Date.now() + Math.random(), enabled: false, title: 'Placeholder' });
                                }
                                targetSection.items[index] = newItem;
                            }

                            targetSection.enabled = true;
                        }
                    }
                });
            }
            // C. Filter/Reorder Skills (Only if explicitly guided)
            if (decision_map.visible_skill_groups && Array.isArray(decision_map.visible_skill_groups) && decision_map.visible_skill_groups.length > 0) {
                // If we have specific skill groups to show, we might reorder them to top or filter
                // For now, let's just make sure we prioritize them if the structure allows.
                // Assuming standard ApplyOS structure where skills might be an array of strings or objects.
                // If skills is array of strings (simple):
                /* 
                   Logic: If the current resume has a 'skills' section, we try to match.
                   However, 'visible_skill_groups' suggests a grouped structure. 
                   If the user has a simple list, we stick to it. 
                   If the user has grouped skills (like sections), we could re-arrange.
                   
                   Safe Fallback: If no complex skill structure is detected, we skip aggressive filtering 
                   to avoid deleting user skills by accident.
                */
            }

            // D. Section Reordering (Metadata only for now, Editor handles rendering order)
            if (decision_map.section_order && Array.isArray(decision_map.section_order) && decision_map.section_order.length > 0) {
                // We create a preference metadata that the Editor can read to re-sort sections
                newData.meta = {
                    ...newData.meta,
                    preferred_section_order: decision_map.section_order
                };
            }

            // E. Add Audit Metadata
            newData.meta = {
                ...(newData.meta || {}), // Ensure meta exists
                tailored_for: "Target Role",
                tailored_at: new Date().toISOString(),
                source_resume_id: selectedResumeId,
                job_context_hash: jobDescription.substring(0, 50) + "..." // Simple context tracker
            };

            // 4. Create New Resume Record
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data: newResume, error: insertError } = await supabase
                .from('resumes')
                .insert({
                    user_id: user.id,
                    title: `Tailored: ${sourceResume.title}`,
                    data: newData
                })
                .select()
                .single();

            if (insertError) throw insertError;

            toast.success("Resume tailored successfully!");

            // 5. Redirect to Editor
            router.push(`/resume/${newResume.id}`);

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to initiate tailoring");
        } finally {
            setIsGenerating(false);
        }
    };

    // If no resumes, don't show this section (or show a prompt to create one)
    if (!resumes || resumes.length === 0) return null;

    return (
        <section className="relative mb-12 group">
            {/* Ambient Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

            <div className="relative bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row gap-10 items-center">

                    {/* Left: Content & Value Prop */}
                    <div className="flex-1 space-y-4 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Powered</span>
                        </div>

                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Tailor your resume to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">any job description</span>
                        </h2>

                        <p className="text-neutral-400 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Paste a job description and let our AI optimize your resume keywords, summary, and bullet points to match perfectly.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                            <div className="flex items-center gap-2 text-sm text-neutral-300">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-400"><Check className="w-3 h-3" /></div>
                                Increase ATS Score
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-300">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-400"><Check className="w-3 h-3" /></div>
                                Highlight Key Skills
                            </div>
                        </div>
                    </div>

                    {/* Right: Interactive Form */}
                    <div className="w-full lg:w-[500px] bg-black/40 border border-white/5 rounded-2xl p-6 shadow-2xl relative">
                        <div className="space-y-4">

                            {/* Input 1: Select Resume */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Select Base Resume</label>
                                <div className="relative group/select">
                                    <FileText className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500 group-focus-within/select:text-blue-400 transition-colors" />
                                    <select
                                        value={selectedResumeId}
                                        onChange={(e) => setSelectedResumeId(e.target.value)}
                                        className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-neutral-800"
                                    >
                                        <option value="" disabled>Choose a resume...</option>
                                        {resumes.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.title || 'Untitled Resume'}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-600">
                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Input 2: Job Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Job Description</label>
                                <div className="relative group/textarea">
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job requirements here..."
                                        className="w-full h-32 bg-neutral-900 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all resize-none placeholder:text-neutral-600 custom-scrollbar"
                                    />
                                    <div className="absolute bottom-3 right-3 p-1.5 bg-neutral-800 rounded-lg text-neutral-500 opacity-0 group-hover/textarea:opacity-100 transition-opacity pointer-events-none">
                                        <Briefcase className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl shadow-lg shadow-white/5 active:scale-[0.98] transition-all group/btn overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <Wand2 className="w-4 h-4 animate-spin" />
                                        Analyzing Match...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Wand2 className="w-4 h-4 text-purple-600" />
                                        Generate Tailored Resume
                                    </span>
                                )}
                            </Button>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

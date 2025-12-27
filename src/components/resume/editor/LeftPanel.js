
import React, { useState } from 'react';
import { ChevronRight, GripVertical, CheckCircle2, Circle, Eye, EyeOff, Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Sub-editors
import { PersonalForm } from './forms/PersonalForm';
import { SectionEditor } from './forms/SectionEditor';

export function LeftPanel({ resumeJson, onChange, onAutoSave, activeSectionId, setActiveSectionId }) {

    // activeSectionId is now a prop

    const [showAddSection, setShowAddSection] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filter active sections
    const enabledSections = resumeJson.sections.filter(s => s.enabled);
    const disabledSections = resumeJson.sections.filter(s => !s.enabled);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        // Create a copy of enabled sections to reorder
        const items = Array.from(enabledSections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Merge back with disabled sections
        const newSections = [...items, ...disabledSections];

        onChange({ ...resumeJson, sections: newSections });
    };

    const toggleSection = (e, id) => {
        if (e) e.stopPropagation();
        const newSections = resumeJson.sections.map(s =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
        );
        onChange({ ...resumeJson, sections: newSections });
        if (showAddSection) setShowAddSection(false); // Close menu if adding
    };

    // Main View: List of Sections
    if (!activeSectionId) {
        return (
            <div className="flex flex-col h-full bg-neutral-900 border-r border-white/10 w-[450px] shrink-0">
                <div className="p-8 border-b border-white/10 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-white mb-1">Resume Sections</h2>
                    <p className="text-sm text-neutral-400">Reorder and manage contents.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
                    {/* Personal Info Card (Fixed) */}
                    <div
                        onClick={() => setActiveSectionId('personal')}
                        className="bg-neutral-800/40 hover:bg-neutral-800 border border-white/5 hover:border-white/20 rounded-2xl p-6 cursor-pointer transition-all group shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <div>
                                    <span className="text-lg font-semibold text-white block leading-tight">Personal Information</span>
                                    <span className="text-xs text-neutral-500 group-hover:text-neutral-400">Name, Contact, Links</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
                        </div>
                    </div>

                    <div className="py-2 flex items-center gap-4">
                        <div className="h-px bg-white/5 flex-1" />
                        <span className="text-xs uppercase tracking-widest text-neutral-600 font-medium">Sections</span>
                        <div className="h-px bg-white/5 flex-1" />
                    </div>

                    {!isMounted ? (
                        /* Static Render for Server/Hydration Match */
                        <div className="space-y-3">
                            {enabledSections.map((section) => (
                                <div
                                    key={section.id}
                                    className="bg-neutral-800/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-sm opacity-50 cursor-wait"
                                >
                                    <div className="flex items-center gap-4">
                                        <GripVertical className="w-5 h-5 text-neutral-600" />
                                        <span className="text-lg font-medium text-white">{section.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <Trash2 className="w-4 h-4 text-neutral-500" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="sections">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                        {enabledSections.map((section, index) => (
                                            <Draggable key={section.id} draggableId={section.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => setActiveSectionId(section.id)}
                                                        className={cn(
                                                            "bg-neutral-800/40 hover:bg-neutral-800 border border-white/5 hover:border-white/20 rounded-2xl p-5 cursor-pointer transition-all group flex items-center justify-between shadow-sm",
                                                            snapshot.isDragging && "shadow-xl ring-2 ring-blue-500/50 bg-neutral-800 z-50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <GripVertical className="w-5 h-5 text-neutral-600 hover:text-neutral-400 cursor-grab active:cursor-grabbing" />
                                                            <span className="text-lg font-medium text-white">{section.label}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => toggleSection(e, section.id)}
                                                                className="h-8 w-8 rounded-lg hover:bg-red-500/20 text-neutral-500 hover:text-red-400 flex items-center justify-center transition-colors group/delete"
                                                                title="Remove Section"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                            <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}

                    {/* Add Section Button */}
                    <div className="relative pt-4">
                        {showAddSection && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowAddSection(false)} />
                                <div className="absolute bottom-full left-0 w-full mb-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 animate-in slide-in-from-bottom-2 fade-in duration-200">
                                    <div className="p-3 border-b border-white/5 bg-neutral-800/50">
                                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Available Sections</span>
                                    </div>
                                    <div className="p-2 max-h-60 overflow-y-auto">
                                        {disabledSections.length > 0 ? (
                                            disabledSections.map(section => (
                                                <button
                                                    key={section.id}
                                                    onClick={(e) => toggleSection(e, section.id)}
                                                    className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg text-left transition-colors group"
                                                >
                                                    <span className="text-sm font-medium text-neutral-300 group-hover:text-white">{section.label}</span>
                                                    <Plus className="w-4 h-4 text-neutral-500 group-hover:text-blue-400" />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-neutral-500">
                                                All sections added.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        <button
                            onClick={() => setShowAddSection(!showAddSection)}
                            className="w-full py-4 rounded-xl border-2 border-dashed border-neutral-800 hover:border-blue-500/30 hover:bg-blue-500/5 text-neutral-500 hover:text-blue-400 transition-all flex items-center justify-center gap-2 font-medium group"
                        >
                            <div className="w-6 h-6 rounded-full bg-neutral-800 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span>Add Section</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Drill-down Editor View
    const activeSection = activeSectionId === 'personal'
        ? resumeJson.personal
        : resumeJson.sections.find(s => s.id === activeSectionId);

    const handleBack = () => setActiveSectionId(null);

    return (
        <div className="flex flex-col h-full bg-neutral-900 border-r border-white/10 w-[450px] shrink-0 animate-in slide-in-from-left-4 duration-300">
            <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-neutral-900/95 backdrop-blur-md sticky top-0 z-10 shadow-lg shadow-black/10">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-white/5"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                    <h2 className="font-bold text-xl text-white">
                        {activeSectionId === 'personal' ? 'Personal Information' : activeSection?.label}
                    </h2>
                    <span className="text-xs text-blue-400 uppercase tracking-wider font-semibold">Editing Section</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                {activeSectionId === 'personal' ? (
                    <PersonalForm
                        data={resumeJson.personal}
                        onChange={(newData) => onChange({ ...resumeJson, personal: newData })}
                    />
                ) : (
                    <SectionEditor
                        section={activeSection}
                        onChange={(newSectionData) => {
                            const newSections = resumeJson.sections.map(s =>
                                s.id === activeSectionId ? { ...s, ...newSectionData } : s
                            );
                            onChange({ ...resumeJson, sections: newSections });
                        }}
                    />
                )}
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Save, AlertCircle, Plus, Trash, Wand2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function ResumeForm({ initialData, onSave }) {
    // Ensure we have a valid object structure even if initialData is empty or partial
    const defaultData = {
        personal: { name: '', email: '', phone: '', linkedin: '', location: '', country: '' },
        summary: '',
        experience: [],
        education: [],
        projects: [],
        certificates: [],
        skills: { technical: [], soft: [] },
        languages: [],
        interests: [],
        achievements: []
    };

    const [data, setData] = useState({
        ...defaultData,
        ...initialData,
        // Ensure nested arrays are also safe arrays if they happen to be undefined in initialData
        experience: initialData?.experience || [],
        education: initialData?.education || [],
        projects: initialData?.projects || [],
        certificates: initialData?.certificates || [],
        skills: { ...defaultData.skills, ...initialData?.skills },
        languages: initialData?.languages || [],
        interests: initialData?.interests || [],
        achievements: initialData?.achievements || []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [optimizingKey, setOptimizingKey] = useState(null); // Track which specific section is optimizing
    const [lastOptimizeTime, setLastOptimizeTime] = useState(0); // Track last optimization time for 5s cooldown
    const supabase = createClient();

    // Helper to update deeply nested state
    const updateField = (section, field, value) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Upsert logic
            const { error } = await supabase
                .from('resumes')
                .upsert({
                    user_id: user.id,
                    data: data,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) throw error;
            onSave(data);

        } catch (err) {
            console.error('Error saving resume:', err);
            alert('Failed to save resume data.');
        } finally {
            setIsSaving(false);
        }
    };

    const [feedback, setFeedback] = useState(null);

    const handleOptimize = async (section_key, section_content) => {
        if (!section_content?.trim()) return;

        if (section_content.length < 50) {
            setFeedback({ key: section_key, message: 'Min 50 chars required', type: 'error' });
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        // Rate limiting check
        const now = Date.now();
        if (now - lastOptimizeTime < 5000) {
            setFeedback({ key: section_key, message: 'Please wait...', type: 'warning' });
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        setOptimizingKey(section_key);
        setLastOptimizeTime(now);

        try {
            const response = await fetch('/api/resume/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_key, section_content })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Optimization failed with status ${response.status}`);
            }

            const result = await response.json();

            if (result.enhanced_content) {
                // Apply update based on section_key structure
                if (section_key === 'summary') {
                    setData(prev => ({ ...prev, summary: result.enhanced_content }));
                } else if (section_key.includes('[')) {
                    // Extract section, index, field
                    const match = section_key.match(/(\w+)\[(\d+)\]\.(\w+)/);
                    if (match) {
                        const [, section, idxStr, field] = match;
                        const index = parseInt(idxStr);

                        if (field === 'description' && section === 'experience') {
                            const list = [...(data[section] || [])];
                            if (list[index]) {
                                list[index][field] = result.enhanced_content.split('\n');
                                setData(prev => ({ ...prev, [section]: list }));
                            }
                        } else {
                            updateItem(section, index, field, result.enhanced_content);
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Optimization request failed", e);
            setFeedback({ key: section_key, message: 'Failed', type: 'error' });
            setTimeout(() => setFeedback(null), 3000);
        } finally {
            setOptimizingKey(null);
        }
    };

    // Generic list helpers
    const addItem = (section, item) => {
        setData(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), item]
        }));
    };

    const updateItem = (section, index, field, value) => {
        const list = [...(data[section] || [])];
        list[index][field] = value;
        setData(prev => ({ ...prev, [section]: list }));
    };

    const removeItem = (section, index) => {
        setData(prev => ({
            ...prev,
            [section]: (prev[section] || []).filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Personal Details */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Full Name</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                            value={data.personal?.name || ''}
                            onChange={(e) => updateField('personal', 'name', e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Email</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                            value={data.personal?.email || ''}
                            onChange={(e) => updateField('personal', 'email', e.target.value)}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Phone</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                            value={data.personal?.phone || ''}
                            onChange={(e) => updateField('personal', 'phone', e.target.value)}
                            placeholder="+1 555 000 0000"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-neutral-400">City, State or Province</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                            value={data.personal?.location || ''}
                            onChange={(e) => updateField('personal', 'location', e.target.value)}
                            placeholder="New York, NY"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Country / Nationality</label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors appearance-none"
                            value={data.personal?.country || ''}
                            onChange={(e) => updateField('personal', 'country', e.target.value)}
                        >
                            <option value="" className="bg-neutral-900">Select Country</option>
                            <option value="United States" className="bg-neutral-900">United States</option>
                            <option value="United Kingdom" className="bg-neutral-900">United Kingdom</option>
                            <option value="Canada" className="bg-neutral-900">Canada</option>
                            <option value="India" className="bg-neutral-900">India</option>
                            <option value="Australia" className="bg-neutral-900">Australia</option>
                            <option value="Germany" className="bg-neutral-900">Germany</option>
                            <option value="France" className="bg-neutral-900">France</option>
                            <option value="Afghanistan" className="bg-neutral-900">Afghanistan</option>
                            <option value="Albania" className="bg-neutral-900">Albania</option>
                            <option value="Algeria" className="bg-neutral-900">Algeria</option>
                            <option value="Andorra" className="bg-neutral-900">Andorra</option>
                            <option value="Angola" className="bg-neutral-900">Angola</option>
                            <option value="Antigua and Barbuda" className="bg-neutral-900">Antigua and Barbuda</option>
                            <option value="Argentina" className="bg-neutral-900">Argentina</option>
                            <option value="Armenia" className="bg-neutral-900">Armenia</option>
                            <option value="Austria" className="bg-neutral-900">Austria</option>
                            <option value="Azerbaijan" className="bg-neutral-900">Azerbaijan</option>
                            <option value="Bahamas" className="bg-neutral-900">Bahamas</option>
                            <option value="Bahrain" className="bg-neutral-900">Bahrain</option>
                            <option value="Bangladesh" className="bg-neutral-900">Bangladesh</option>
                            <option value="Barbados" className="bg-neutral-900">Barbados</option>
                            <option value="Belarus" className="bg-neutral-900">Belarus</option>
                            <option value="Belgium" className="bg-neutral-900">Belgium</option>
                            <option value="Belize" className="bg-neutral-900">Belize</option>
                            <option value="Benin" className="bg-neutral-900">Benin</option>
                            <option value="Bhutan" className="bg-neutral-900">Bhutan</option>
                            <option value="Bolivia" className="bg-neutral-900">Bolivia</option>
                            <option value="Bosnia and Herzegovina" className="bg-neutral-900">Bosnia and Herzegovina</option>
                            <option value="Botswana" className="bg-neutral-900">Botswana</option>
                            <option value="Brazil" className="bg-neutral-900">Brazil</option>
                            <option value="Brunei" className="bg-neutral-900">Brunei</option>
                            <option value="Bulgaria" className="bg-neutral-900">Bulgaria</option>
                            <option value="Burkina Faso" className="bg-neutral-900">Burkina Faso</option>
                            <option value="Burundi" className="bg-neutral-900">Burundi</option>
                            <option value="Cabo Verde" className="bg-neutral-900">Cabo Verde</option>
                            <option value="Cambodia" className="bg-neutral-900">Cambodia</option>
                            <option value="Cameroon" className="bg-neutral-900">Cameroon</option>
                            <option value="Central African Republic" className="bg-neutral-900">Central African Republic</option>
                            <option value="Chad" className="bg-neutral-900">Chad</option>
                            <option value="Chile" className="bg-neutral-900">Chile</option>
                            <option value="China" className="bg-neutral-900">China</option>
                            <option value="Colombia" className="bg-neutral-900">Colombia</option>
                            <option value="Comoros" className="bg-neutral-900">Comoros</option>
                            <option value="Congo, Democratic Republic of the" className="bg-neutral-900">Congo, Democratic Republic of the</option>
                            <option value="Congo, Republic of the" className="bg-neutral-900">Congo, Republic of the</option>
                            <option value="Costa Rica" className="bg-neutral-900">Costa Rica</option>
                            <option value="Croatia" className="bg-neutral-900">Croatia</option>
                            <option value="Cuba" className="bg-neutral-900">Cuba</option>
                            <option value="Cyprus" className="bg-neutral-900">Cyprus</option>
                            <option value="Czech Republic" className="bg-neutral-900">Czech Republic</option>
                            <option value="Denmark" className="bg-neutral-900">Denmark</option>
                            <option value="Djibouti" className="bg-neutral-900">Djibouti</option>
                            <option value="Dominica" className="bg-neutral-900">Dominica</option>
                            <option value="Dominican Republic" className="bg-neutral-900">Dominican Republic</option>
                            <option value="East Timor" className="bg-neutral-900">East Timor</option>
                            <option value="Ecuador" className="bg-neutral-900">Ecuador</option>
                            <option value="Egypt" className="bg-neutral-900">Egypt</option>
                            <option value="El Salvador" className="bg-neutral-900">El Salvador</option>
                            <option value="Equatorial Guinea" className="bg-neutral-900">Equatorial Guinea</option>
                            <option value="Eritrea" className="bg-neutral-900">Eritrea</option>
                            <option value="Estonia" className="bg-neutral-900">Estonia</option>
                            <option value="Eswatini" className="bg-neutral-900">Eswatini</option>
                            <option value="Ethiopia" className="bg-neutral-900">Ethiopia</option>
                            <option value="Fiji" className="bg-neutral-900">Fiji</option>
                            <option value="Finland" className="bg-neutral-900">Finland</option>
                            <option value="Gabon" className="bg-neutral-900">Gabon</option>
                            <option value="Gambia" className="bg-neutral-900">Gambia</option>
                            <option value="Georgia" className="bg-neutral-900">Georgia</option>
                            <option value="Ghana" className="bg-neutral-900">Ghana</option>
                            <option value="Greece" className="bg-neutral-900">Greece</option>
                            <option value="Grenada" className="bg-neutral-900">Grenada</option>
                            <option value="Guatemala" className="bg-neutral-900">Guatemala</option>
                            <option value="Guinea" className="bg-neutral-900">Guinea</option>
                            <option value="Guinea-Bissau" className="bg-neutral-900">Guinea-Bissau</option>
                            <option value="Guyana" className="bg-neutral-900">Guyana</option>
                            <option value="Haiti" className="bg-neutral-900">Haiti</option>
                            <option value="Honduras" className="bg-neutral-900">Honduras</option>
                            <option value="Hungary" className="bg-neutral-900">Hungary</option>
                            <option value="Iceland" className="bg-neutral-900">Iceland</option>
                            <option value="Indonesia" className="bg-neutral-900">Indonesia</option>
                            <option value="Iran" className="bg-neutral-900">Iran</option>
                            <option value="Iraq" className="bg-neutral-900">Iraq</option>
                            <option value="Ireland" className="bg-neutral-900">Ireland</option>
                            <option value="Israel" className="bg-neutral-900">Israel</option>
                            <option value="Italy" className="bg-neutral-900">Italy</option>
                            <option value="Ivory Coast" className="bg-neutral-900">Ivory Coast</option>
                            <option value="Jamaica" className="bg-neutral-900">Jamaica</option>
                            <option value="Japan" className="bg-neutral-900">Japan</option>
                            <option value="Jordan" className="bg-neutral-900">Jordan</option>
                            <option value="Kazakhstan" className="bg-neutral-900">Kazakhstan</option>
                            <option value="Kenya" className="bg-neutral-900">Kenya</option>
                            <option value="Kiribati" className="bg-neutral-900">Kiribati</option>
                            <option value="Korea, North" className="bg-neutral-900">Korea, North</option>
                            <option value="Korea, South" className="bg-neutral-900">Korea, South</option>
                            <option value="Kosovo" className="bg-neutral-900">Kosovo</option>
                            <option value="Kuwait" className="bg-neutral-900">Kuwait</option>
                            <option value="Kyrgyzstan" className="bg-neutral-900">Kyrgyzstan</option>
                            <option value="Laos" className="bg-neutral-900">Laos</option>
                            <option value="Latvia" className="bg-neutral-900">Latvia</option>
                            <option value="Lebanon" className="bg-neutral-900">Lebanon</option>
                            <option value="Lesotho" className="bg-neutral-900">Lesotho</option>
                            <option value="Liberia" className="bg-neutral-900">Liberia</option>
                            <option value="Libya" className="bg-neutral-900">Libya</option>
                            <option value="Liechtenstein" className="bg-neutral-900">Liechtenstein</option>
                            <option value="Lithuania" className="bg-neutral-900">Lithuania</option>
                            <option value="Luxembourg" className="bg-neutral-900">Luxembourg</option>
                            <option value="Madagascar" className="bg-neutral-900">Madagascar</option>
                            <option value="Malawi" className="bg-neutral-900">Malawi</option>
                            <option value="Malaysia" className="bg-neutral-900">Malaysia</option>
                            <option value="Maldives" className="bg-neutral-900">Maldives</option>
                            <option value="Mali" className="bg-neutral-900">Mali</option>
                            <option value="Malta" className="bg-neutral-900">Malta</option>
                            <option value="Marshall Islands" className="bg-neutral-900">Marshall Islands</option>
                            <option value="Mauritania" className="bg-neutral-900">Mauritania</option>
                            <option value="Mauritius" className="bg-neutral-900">Mauritius</option>
                            <option value="Mexico" className="bg-neutral-900">Mexico</option>
                            <option value="Micronesia" className="bg-neutral-900">Micronesia</option>
                            <option value="Moldova" className="bg-neutral-900">Moldova</option>
                            <option value="Monaco" className="bg-neutral-900">Monaco</option>
                            <option value="Mongolia" className="bg-neutral-900">Mongolia</option>
                            <option value="Montenegro" className="bg-neutral-900">Montenegro</option>
                            <option value="Morocco" className="bg-neutral-900">Morocco</option>
                            <option value="Mozambique" className="bg-neutral-900">Mozambique</option>
                            <option value="Myanmar" className="bg-neutral-900">Myanmar</option>
                            <option value="Namibia" className="bg-neutral-900">Namibia</option>
                            <option value="Nauru" className="bg-neutral-900">Nauru</option>
                            <option value="Nepal" className="bg-neutral-900">Nepal</option>
                            <option value="Netherlands" className="bg-neutral-900">Netherlands</option>
                            <option value="New Zealand" className="bg-neutral-900">New Zealand</option>
                            <option value="Nicaragua" className="bg-neutral-900">Nicaragua</option>
                            <option value="Niger" className="bg-neutral-900">Niger</option>
                            <option value="Nigeria" className="bg-neutral-900">Nigeria</option>
                            <option value="North Macedonia" className="bg-neutral-900">North Macedonia</option>
                            <option value="Norway" className="bg-neutral-900">Norway</option>
                            <option value="Oman" className="bg-neutral-900">Oman</option>
                            <option value="Pakistan" className="bg-neutral-900">Pakistan</option>
                            <option value="Palau" className="bg-neutral-900">Palau</option>
                            <option value="Palestine" className="bg-neutral-900">Palestine</option>
                            <option value="Panama" className="bg-neutral-900">Panama</option>
                            <option value="Papua New Guinea" className="bg-neutral-900">Papua New Guinea</option>
                            <option value="Paraguay" className="bg-neutral-900">Paraguay</option>
                            <option value="Peru" className="bg-neutral-900">Peru</option>
                            <option value="Philippines" className="bg-neutral-900">Philippines</option>
                            <option value="Poland" className="bg-neutral-900">Poland</option>
                            <option value="Portugal" className="bg-neutral-900">Portugal</option>
                            <option value="Qatar" className="bg-neutral-900">Qatar</option>
                            <option value="Romania" className="bg-neutral-900">Romania</option>
                            <option value="Russia" className="bg-neutral-900">Russia</option>
                            <option value="Rwanda" className="bg-neutral-900">Rwanda</option>
                            <option value="Saint Kitts and Nevis" className="bg-neutral-900">Saint Kitts and Nevis</option>
                            <option value="Saint Lucia" className="bg-neutral-900">Saint Lucia</option>
                            <option value="Saint Vincent and the Grenadines" className="bg-neutral-900">Saint Vincent and the Grenadines</option>
                            <option value="Samoa" className="bg-neutral-900">Samoa</option>
                            <option value="San Marino" className="bg-neutral-900">San Marino</option>
                            <option value="Sao Tome and Principe" className="bg-neutral-900">Sao Tome and Principe</option>
                            <option value="Saudi Arabia" className="bg-neutral-900">Saudi Arabia</option>
                            <option value="Senegal" className="bg-neutral-900">Senegal</option>
                            <option value="Serbia" className="bg-neutral-900">Serbia</option>
                            <option value="Seychelles" className="bg-neutral-900">Seychelles</option>
                            <option value="Sierra Leone" className="bg-neutral-900">Sierra Leone</option>
                            <option value="Singapore" className="bg-neutral-900">Singapore</option>
                            <option value="Slovakia" className="bg-neutral-900">Slovakia</option>
                            <option value="Slovenia" className="bg-neutral-900">Slovenia</option>
                            <option value="Solomon Islands" className="bg-neutral-900">Solomon Islands</option>
                            <option value="Somalia" className="bg-neutral-900">Somalia</option>
                            <option value="South Africa" className="bg-neutral-900">South Africa</option>
                            <option value="South Sudan" className="bg-neutral-900">South Sudan</option>
                            <option value="Spain" className="bg-neutral-900">Spain</option>
                            <option value="Sri Lanka" className="bg-neutral-900">Sri Lanka</option>
                            <option value="Sudan" className="bg-neutral-900">Sudan</option>
                            <option value="Suriname" className="bg-neutral-900">Suriname</option>
                            <option value="Sweden" className="bg-neutral-900">Sweden</option>
                            <option value="Switzerland" className="bg-neutral-900">Switzerland</option>
                            <option value="Syria" className="bg-neutral-900">Syria</option>
                            <option value="Taiwan" className="bg-neutral-900">Taiwan</option>
                            <option value="Tajikistan" className="bg-neutral-900">Tajikistan</option>
                            <option value="Tanzania" className="bg-neutral-900">Tanzania</option>
                            <option value="Thailand" className="bg-neutral-900">Thailand</option>
                            <option value="Togo" className="bg-neutral-900">Togo</option>
                            <option value="Tonga" className="bg-neutral-900">Tonga</option>
                            <option value="Trinidad and Tobago" className="bg-neutral-900">Trinidad and Tobago</option>
                            <option value="Tunisia" className="bg-neutral-900">Tunisia</option>
                            <option value="Turkey" className="bg-neutral-900">Turkey</option>
                            <option value="Turkmenistan" className="bg-neutral-900">Turkmenistan</option>
                            <option value="Tuvalu" className="bg-neutral-900">Tuvalu</option>
                            <option value="Uganda" className="bg-neutral-900">Uganda</option>
                            <option value="Ukraine" className="bg-neutral-900">Ukraine</option>
                            <option value="United Arab Emirates" className="bg-neutral-900">United Arab Emirates</option>
                            <option value="Uruguay" className="bg-neutral-900">Uruguay</option>
                            <option value="Uzbekistan" className="bg-neutral-900">Uzbekistan</option>
                            <option value="Vanuatu" className="bg-neutral-900">Vanuatu</option>
                            <option value="Vatican City" className="bg-neutral-900">Vatican City</option>
                            <option value="Venezuela" className="bg-neutral-900">Venezuela</option>
                            <option value="Vietnam" className="bg-neutral-900">Vietnam</option>
                            <option value="Yemen" className="bg-neutral-900">Yemen</option>
                            <option value="Zambia" className="bg-neutral-900">Zambia</option>
                            <option value="Zimbabwe" className="bg-neutral-900">Zimbabwe</option>
                        </select>
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-xs text-neutral-400">LinkedIn / Portfolio URL</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                            value={data.personal?.linkedin || ''}
                            onChange={(e) => updateField('personal', 'linkedin', e.target.value)}
                            placeholder="linkedin.com/in/johndoe"
                        />
                    </div>
                </div>
            </div>

            {/* Professional Summary */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Professional Summary</h3>
                    <button
                        onClick={() => handleOptimize('summary', data.summary)}
                        disabled={optimizingKey === 'summary'}
                        className={`text-xs flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-wait ${feedback?.key === 'summary' && feedback.type === 'error' ? 'text-red-400' : 'text-purple-400 hover:text-purple-300'}`}
                    >
                        <Wand2 className={`w-3 h-3 ${optimizingKey === 'summary' ? 'animate-spin' : ''}`} />
                        {optimizingKey === 'summary' ? 'Optimizing...' : (feedback?.key === 'summary' ? feedback.message : 'Optimize with AI')}
                    </button>
                </div>
                <textarea
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors resize-none"
                    value={data.summary || ''}
                    onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Briefly describe your professional background and key achievements..."
                />
            </div>

            {/* Education */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-lg font-semibold text-white">Education</h3>
                    <button
                        onClick={() => addItem('education', { school: '', dates: '', degree: '', location: '' })}
                        className="text-sm flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                    >
                        <Plus className="w-4 h-4" />
                        Add Education
                    </button>
                </div>
                {data.education?.map((edu, index) => (
                    <div key={index} className="glass-panel p-6 rounded-xl space-y-4 relative group">
                        <button onClick={() => removeItem('education', index)} className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-white/5">
                            <Trash className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400">School / University</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={edu.school || ''} onChange={(e) => updateItem('education', index, 'school', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400">Dates</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={edu.dates || ''} onChange={(e) => updateItem('education', index, 'dates', e.target.value)} placeholder="e.g. 2016 - 2020" />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <label className="text-xs text-neutral-400">Degree / Major</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={edu.degree || ''} onChange={(e) => updateItem('education', index, 'degree', e.target.value)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Projects */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-lg font-semibold text-white">Projects</h3>
                    <button
                        onClick={() => addItem('projects', { name: '', link: '', description: '', tech: '' })}
                        className="text-sm flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                    >
                        <Plus className="w-4 h-4" />
                        Add Project
                    </button>
                </div>
                {data.projects?.map((proj, index) => (
                    <div key={index} className="glass-panel p-6 rounded-xl space-y-4 relative group">
                        <button onClick={() => removeItem('projects', index)} className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-white/5">
                            <Trash className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400">Project Name</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={proj.name || ''} onChange={(e) => updateItem('projects', index, 'name', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400">Link</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={proj.link || ''} onChange={(e) => updateItem('projects', index, 'link', e.target.value)} />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <label className="text-xs text-neutral-400">Tech Stack</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={proj.tech || ''} onChange={(e) => updateItem('projects', index, 'tech', e.target.value)} placeholder="React, Node.js, AI" />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs text-neutral-400">Description</label>
                                    <button
                                        onClick={() => handleOptimize(`projects[${index}].description`, proj.description)}
                                        disabled={optimizingKey === `projects[${index}].description`}
                                        className={`text-xs flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-wait ${feedback?.key === `projects[${index}].description` && feedback.type === 'error' ? 'text-red-400' : 'text-purple-400 hover:text-purple-300'}`}
                                    >
                                        <Wand2 className={`w-3 h-3 ${optimizingKey === `projects[${index}].description` ? 'animate-spin' : ''}`} />
                                        {optimizingKey === `projects[${index}].description` ? 'Optimizing...' : (feedback?.key === `projects[${index}].description` ? feedback.message : 'Optimize with AI')}
                                    </button>
                                </div>
                                <textarea className="w-full h-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors resize-none"
                                    value={proj.description || ''} onChange={(e) => updateItem('projects', index, 'description', e.target.value)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Experience */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-lg font-semibold text-white">Experience</h3>
                    <button
                        onClick={() => addItem('experience', { company: '', role: '', dates: '', description: [''] })}
                        className="text-sm flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                    >
                        <Plus className="w-4 h-4" />
                        Add Position
                    </button>
                </div>
                {data.experience?.map((exp, index) => (
                    <div key={index} className="glass-panel p-6 rounded-xl space-y-4 relative group">
                        <button
                            onClick={() => removeItem('experience', index)}
                            className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-white/5"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400">Company</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={exp.company || ''}
                                    onChange={(e) => updateItem('experience', index, 'company', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400">Dates</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={exp.dates || ''}
                                    onChange={(e) => updateItem('experience', index, 'dates', e.target.value)}
                                    placeholder="e.g. 2020 - Present"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <label className="text-xs text-neutral-400">Role Title</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={exp.role || ''}
                                    onChange={(e) => updateItem('experience', index, 'role', e.target.value)}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs text-neutral-400">Description (Bullet points)</label>
                                    <button
                                        onClick={() => handleOptimize(`experience[${index}].description`, Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || ''))}
                                        disabled={optimizingKey === `experience[${index}].description`}
                                        className={`text-xs flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-wait ${feedback?.key === `experience[${index}].description` && feedback.type === 'error' ? 'text-red-400' : 'text-purple-400 hover:text-purple-300'}`}
                                    >
                                        <Wand2 className={`w-3 h-3 ${optimizingKey === `experience[${index}].description` ? 'animate-spin' : ''}`} />
                                        {optimizingKey === `experience[${index}].description` ? 'Optimizing...' : (feedback?.key === `experience[${index}].description` ? feedback.message : 'Optimize with AI')}
                                    </button>
                                </div>
                                <textarea
                                    className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors resize-none"
                                    value={Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || '')}
                                    onChange={(e) => updateItem('experience', index, 'description', e.target.value.split('\n'))}
                                    placeholder="• Achieved X results..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Skills */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
                <h3 className="text-lg font-semibold text-white">Skills</h3>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Technical Skills (Comma separated)</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                            value={data.skills?.technical?.join(', ') || ''}
                            onChange={(e) => updateField('skills', 'technical', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="React, Next.js, SQL, Python"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Soft Skills (Comma separated)</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                            value={data.skills?.soft?.join(', ') || ''}
                            onChange={(e) => updateField('skills', 'soft', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="Leadership, Communication, Problem Solving"
                        />
                    </div>
                </div>
            </div>

            {/* Certificates */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-lg font-semibold text-white">Certificates</h3>
                    <button
                        onClick={() => addItem('certificates', { name: '', issuer: '', date: '', link: '' })}
                        className="text-sm flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                    >
                        <Plus className="w-4 h-4" />
                        Add Certificate
                    </button>
                </div>
                {data.certificates?.map((cert, index) => (
                    <div key={index} className="glass-panel p-6 rounded-xl space-y-4 relative group">
                        <button onClick={() => removeItem('certificates', index)} className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-white/5">
                            <Trash className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400">Name</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={cert.name || ''} onChange={(e) => updateItem('certificates', index, 'name', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400">Issuer</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={cert.issuer || ''} onChange={(e) => updateItem('certificates', index, 'issuer', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400">Date</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                                    value={cert.date || ''} onChange={(e) => updateItem('certificates', index, 'date', e.target.value)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Info: Languages, Interests, Achievements */}
            <div className="glass-panel p-6 rounded-xl space-y-6">
                <h3 className="text-lg font-semibold text-white">Additional Information</h3>

                {/* Languages */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Languages (Comma separated)</label>
                    <input
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                        value={data.languages?.join(', ') || ''}
                        onChange={(e) => setData(prev => ({ ...prev, languages: e.target.value.split(',').map(s => s.trim()) }))}
                        placeholder="English (Native), Spanish (B2)"
                    />
                </div>

                {/* Interests */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Interests (Comma separated)</label>
                    <input
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 outline-none transition-colors"
                        value={data.interests?.join(', ') || ''}
                        onChange={(e) => setData(prev => ({ ...prev, interests: e.target.value.split(',').map(s => s.trim()) }))}
                        placeholder="Photography, Hiking, Chess"
                    />
                </div>

                {/* Achievements */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-white">Achievements</label>
                        <button onClick={() => addItem('achievements', { title: '', description: '' })} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                    </div>
                    {data.achievements?.map((ach, i) => (
                        <div key={i} className="flex gap-2 items-start">
                            <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                value={ach.title || ''} onChange={(e) => updateItem('achievements', i, 'title', e.target.value)} placeholder="Achievement Title" />
                            <button onClick={() => removeItem('achievements', i)} className="p-2 text-neutral-500 hover:text-red-400"><Trash className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Bar */}
            <div className="sticky bottom-6 z-20 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Resume'}
                    <Save className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

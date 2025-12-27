
import React from 'react';
import { User, Mail, Phone, MapPin, Linkedin, Globe, Briefcase } from 'lucide-react';

export function PersonalForm({ data, onChange }) {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-300">Full Name</label>
                <div className="relative group">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={data?.name || ''}
                        onChange={e => handleChange('name', e.target.value)}
                        className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-base text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-neutral-600 focus:bg-neutral-800"
                        placeholder="John Doe"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-300">Professional Title</label>
                <div className="relative group">
                    <Briefcase className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={data?.title || ''}
                        onChange={e => handleChange('title', e.target.value)}
                        className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-base text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-neutral-600 focus:bg-neutral-800"
                        placeholder="Software Engineer"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-neutral-300">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            value={data?.email || ''}
                            onChange={e => handleChange('email', e.target.value)}
                            className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-base text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-neutral-600 focus:bg-neutral-800"
                            placeholder="email@example.com"
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-neutral-300">Phone</label>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            value={data?.phone || ''}
                            onChange={e => handleChange('phone', e.target.value)}
                            className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-base text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-neutral-600 focus:bg-neutral-800"
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-300">Location</label>
                <div className="relative group">
                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={data?.location || ''}
                        onChange={e => handleChange('location', e.target.value)}
                        className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-base text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-neutral-600 focus:bg-neutral-800"
                        placeholder="San Francisco, CA"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-300">LinkedIn URL</label>
                <div className="relative group">
                    <Linkedin className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={data?.linkedin || ''}
                        onChange={e => handleChange('linkedin', e.target.value)}
                        className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-base text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-neutral-600 focus:bg-neutral-800"
                        placeholder="linkedin.com/in/johndoe"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-300">Portfolio / Website</label>
                <div className="relative group">
                    <Globe className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={data?.url || ''}
                        onChange={e => handleChange('url', e.target.value)}
                        className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-base text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-neutral-600 focus:bg-neutral-800"
                        placeholder="johndoe.com"
                    />
                </div>
            </div>
        </div>
    );
}

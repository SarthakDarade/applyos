'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, Activity } from 'lucide-react';

export function AnalyticsChart({ data }) {
    // data = [{ date: '2024-01-01', applications: 2, scans: 5 }, ...]
    const [hoveredIndex, setHoveredIndex] = useState(null);

    if (!data || data.length === 0) return null;

    // Dimensions
    const width = 100; // viewBox width
    const height = 40; // viewBox height
    const padding = 2;

    const maxVal = Math.max(...data.map(d => Math.max(d.applications, d.scans)), 5);

    // Helper to scale Y
    const getY = (val) => height - padding - ((val / maxVal) * (height - padding * 2));
    // Helper to scale X
    const getX = (index) => padding + (index / (data.length - 1)) * (width - padding * 2);

    // Generate Path Data for Spline
    const generatePath = (key) => {
        let path = `M ${getX(0)},${getY(data[0][key])}`;
        for (let i = 0; i < data.length - 1; i++) {
            const x1 = getX(i);
            const y1 = getY(data[i][key]);
            const x2 = getX(i + 1);
            const y2 = getY(data[i + 1][key]);
            // Simple Line for now, Bezier adds better "premium" feel but harder to calculate perfectly without library
            // Let's do a simple smooth-ish approximation or straight line for robustness
            path += ` L ${x2},${y2}`;
        }
        return path;
    };

    const appsPath = generatePath('applications');
    const scansPath = generatePath('scans');

    // Generate Area fill
    const appsArea = `${appsPath} L ${width},${height} L 0,${height} Z`;
    const scansArea = `${scansPath} L ${width},${height} L 0,${height} Z`;

    const totalApps = data.reduce((acc, curr) => acc + curr.applications, 0);
    const totalScans = data.reduce((acc, curr) => acc + curr.scans, 0);

    return (
        <div className="glass-panel p-6 rounded-xl space-y-6 relative overflow-hidden group">
            {/* Header / Legend */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        Activity Trends
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Last 14 days performance</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">{totalApps}</p>
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-xs text-neutral-400">Applications</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">{totalScans}</p>
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            <span className="text-xs text-neutral-400">Matches</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-48 w-full mt-4" onMouseLeave={() => setHoveredIndex(null)}>
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="appsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Scans Layer (Back) */}
                    <path d={scansArea} fill="url(#scansGradient)" className="transition-all duration-300" />
                    <path d={scansPath} fill="none" stroke="#a855f7" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 drop-shadow-lg" />

                    {/* Apps Layer (Front) */}
                    <path d={appsArea} fill="url(#appsGradient)" className="transition-all duration-300" />
                    <path d={appsPath} fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg" />

                    {/* Hover Interaction Overlay */}
                    {data.map((d, i) => (
                        <rect
                            key={i}
                            x={getX(i) - 1} // Hitbox
                            y={0}
                            width={2}
                            height={height}
                            fill="transparent"
                            onMouseEnter={() => setHoveredIndex(i)}
                            className="cursor-crosshair"
                        />
                    ))}

                    {/* Hover Indicator */}
                    {hoveredIndex !== null && (
                        <g>
                            <line
                                x1={getX(hoveredIndex)} y1={0}
                                x2={getX(hoveredIndex)} y2={height}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="0.2"
                                strokeDasharray="1 1"
                            />
                            {/* Dots */}
                            <circle cx={getX(hoveredIndex)} cy={getY(data[hoveredIndex].applications)} r="1" fill="#3b82f6" stroke="white" strokeWidth="0.2" />
                            <circle cx={getX(hoveredIndex)} cy={getY(data[hoveredIndex].scans)} r="1" fill="#a855f7" stroke="white" strokeWidth="0.2" />
                        </g>
                    )}
                </svg>

                {/* Tooltip HTML Overlay */}
                {hoveredIndex !== null && (
                    <div
                        className="absolute bg-neutral-900/90 backdrop-blur border border-white/10 p-2 rounded-lg shadow-xl pointer-events-none z-10 space-y-1 w-32"
                        style={{
                            left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
                            top: '10%',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <p className="text-[10px] text-neutral-400 font-medium mb-1 border-b border-white/5 pb-1">
                            {new Date(data[hoveredIndex].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <div className="flex justify-between text-xs">
                            <span className="text-blue-400">Applied</span>
                            <span className="text-white font-bold">{data[hoveredIndex].applications}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-purple-400">Matches</span>
                            <span className="text-white font-bold">{data[hoveredIndex].scans}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

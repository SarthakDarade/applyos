import { ResumeUploader } from '@/components/dashboard/resume-uploader'
import { PreferencesForm } from '@/components/dashboard/preferences-form'
import { createClient } from '@/lib/supabase/server'
import { StatsGrid } from '@/components/dashboard/analytics/stats-grid'
import { SkillsWidget } from '@/components/dashboard/analytics/skills-widget'
import { ActivityFeed } from '@/components/dashboard/analytics/activity-feed'
import { HealthScoreCard } from '@/components/dashboard/insights/health-score'
import { InsightsList } from '@/components/dashboard/insights/insights-list'
import { AnalyticsChart } from '@/components/dashboard/analytics/analytics-chart'
import { calculateProfileContext } from '@/lib/insights'
import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting'
import { WeeklyGoals } from '@/components/dashboard/widgets/weekly-goals'
import { QuickTip } from '@/components/dashboard/widgets/quick-tip'
import { IndustryBenchmark } from '@/components/dashboard/widgets/industry-benchmark'
import { RecentResumesWidget } from '@/components/dashboard/widgets/recent-resumes'

export const metadata = {
    title: 'Dashboard - ApplyOS',
}

export default async function Dashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in to view your dashboard.</div>
    }

    // 1. Fetch Profile for Analytics
    const { data: profile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    // Normalize Skills for Dashboard (Fix for potential JSON stringified skills)
    if (profile && Array.isArray(profile.skills)) {
        let normalizedSkills = [];
        profile.skills.forEach(skill => {
            if (typeof skill === 'string' && (skill.trim().startsWith('{') || skill.trim().startsWith('['))) {
                try {
                    const parsed = JSON.parse(skill);
                    if (parsed.items && Array.isArray(parsed.items)) {
                        normalizedSkills.push(...parsed.items);
                    } else if (Array.isArray(parsed)) {
                        normalizedSkills.push(...parsed);
                    } else {
                        normalizedSkills.push(skill);
                    }
                } catch (e) {
                    normalizedSkills.push(skill);
                }
            } else if (typeof skill === 'object' && skill !== null && skill.items) {
                normalizedSkills.push(...(skill.items || []));
            } else {
                normalizedSkills.push(skill);
            }
        });
        profile.skills = [...new Set(normalizedSkills)].filter(s => typeof s === 'string');
    }

    // Calculate Insights Live
    const context = calculateProfileContext(profile)
    const { healthScore, suggestions } = context

    // 2. Fetch Previous Snapshot for Trend
    const { data: lastSnapshot } = await supabase
        .from('profile_snapshots')
        .select('health_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    const previousScore = lastSnapshot?.health_score || 0
    const trend = previousScore > 0 ? healthScore - previousScore : 0

    // 3. Fetch Resume (Existing logic) - Fetch MORE for the list
    const { data: userResumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }) // Use updated_at for relevance
        .limit(5)

    const activeResume = userResumes?.[0]

    // 4. Fetch Activity Log
    const { data: activities } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

    // 5. Fetch Stats (Merged from system & manual apps) with created_at for charts
    // A. System Applications Stats
    const { data: systemApps } = await supabase
        .from('applications')
        .select('status, created_at')
        .eq('user_id', user.id)

    // B. Manual Applications Stats
    const { data: manualApps } = await supabase
        .from('manual_applications')
        .select('status, created_at')
        .eq('user_id', user.id)

    // C. Job Match Scans
    // C. Job Match Scans (via Activity Log)
    const { count: matchCount, data: matchScans } = await supabase
        .from('user_activity_log')
        .select('created_at', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('action_type', 'job_scan')
        .order('created_at', { ascending: false })

    // Combine & Calculate
    const allApps = [
        ...(systemApps?.map(a => ({ ...a, type: 'system' })) || []),
        ...(manualApps?.map(a => ({ ...a, type: 'manual' })) || [])
    ]

    const stats = {
        matched: matchCount || 0,
        applied: allApps.filter(a => a.status?.toLowerCase() === 'applied').length,
        responses: allApps.filter(a => a.status?.toLowerCase() === 'offer').length,
        interviews: allApps.filter(a => a.status?.toLowerCase() === 'interviewing').length
    }

    // --- ANALYTICS PREP ---
    // Generate last 14 days activity
    const last14Days = [...Array(14)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toISOString().split('T')[0]
    }).reverse()

    const activityChartData = last14Days.map(date => {
        // Simple string matching for date YYYY-MM-DD
        const appsCount = allApps.filter(a => a.created_at && a.created_at.startsWith(date)).length
        const scansCount = matchScans?.filter(s => s.created_at && s.created_at.startsWith(date)).length || 0
        return { date, applications: appsCount, scans: scansCount }
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Greeting Header */}
            <DashboardGreeting user={user} />

            {/* Core Metrics Grid */}
            <StatsGrid stats={stats} />

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column (Main) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Row 1: Benchmark + Goals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-80">
                        <IndustryBenchmark />
                        <WeeklyGoals />
                    </div>

                    {/* Insights Row */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Actionable Insights</h3>
                            <span className="text-xs text-neutral-600">Updated just now</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Health Score */}
                            <HealthScoreCard score={healthScore} trend={trend} />

                            {/* Suggestions List */}
                            <InsightsList suggestions={suggestions} />
                        </div>
                    </div>

                    {/* Row 3: Resumes +Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RecentResumesWidget resumes={userResumes} />
                        <SkillsWidget skills={profile?.skills || []} />
                    </div>

                    {/* System Setup Row */}
                    <div>
                        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide mb-4">System Setup</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-full">
                                <ResumeUploader existingResume={activeResume} />
                            </div>
                            <div className="h-full">
                                <PreferencesForm />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Side) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Quick Tip */}
                    <QuickTip />
                </div>

            </div>
        </div>
    )
}

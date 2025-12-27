'use client';

import { useState, useEffect } from 'react';
import { Target, Trophy, ArrowUpRight, Plus, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { createClient } from '@/lib/supabase/client';

export function WeeklyGoals() {
    const supabase = createClient();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newGoalText, setNewGoalText] = useState('');

    const defaultGoals = [
        { id: 1, text: 'Apply to 10 jobs', current: 0, target: 10, completed: false, color: 'emerald' },
        { id: 2, text: 'Update Resume skills', current: 0, target: 1, completed: false, color: 'blue' },
        { id: 3, text: 'Reach out to 3 recruiters', current: 0, target: 3, completed: false, color: 'purple' },
    ];

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const saved = user.user_metadata?.weekly_goals;
                if (saved && Array.isArray(saved) && saved.length > 0) {
                    setGoals(saved);
                } else {
                    setGoals(defaultGoals);
                    // Intentionally not auto-saving defaults to DB until user interacts, 
                    // to keep user_metadata clean, or we can sync immediately. 
                    // Let's sync on first interaction.
                }
            } else {
                setGoals(defaultGoals);
            }
        } catch (error) {
            console.error('Error loading goals:', error);
            setGoals(defaultGoals);
        } finally {
            setLoading(false);
        }
    };

    const syncGoals = async (newGoals) => {
        setGoals(newGoals);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { weekly_goals: newGoals }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error syncing goals:', error);
            // Optionally revert state or show toast
        }
    };

    const toggleGoal = (id) => {
        const newGoals = goals.map(g => {
            if (g.id === id) {
                const willComplete = !g.completed;
                if (willComplete) {
                    confetti({
                        particleCount: 50,
                        spread: 60,
                        origin: { y: 0.7 },
                        colors: ['#34d399', '#60a5fa', '#a78bfa'] // Emerald, Blue, Purple
                    });
                }
                return { ...g, completed: !g.completed };
            }
            return g;
        });
        syncGoals(newGoals);
    };

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!newGoalText.trim()) return;

        const colors = ['emerald', 'blue', 'purple', 'pink', 'orange'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newGoal = {
            id: Date.now(),
            text: newGoalText,
            current: 0,
            target: 1,
            completed: false,
            color: randomColor
        };

        const updated = [...goals, newGoal];
        syncGoals(updated);
        setNewGoalText('');
        setIsAdding(false);
    };

    const deleteGoal = (id, e) => {
        e.stopPropagation(); // Prevent toggle
        const updated = goals.filter(g => g.id !== id);
        syncGoals(updated);
    };

    const completedCount = goals.filter(g => g.completed).length;
    const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

    return (
        <div className="glass-panel p-6 rounded-xl h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-transparent">
            {/* Background glow for progress */}
            <div
                className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-1000 blur-[2px]"
                style={{ width: `${progress}%` }}
            />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-sm font-medium text-emerald-200 uppercase tracking-wide flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        Weekly Goals
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                        {completedCount} of {goals.length} completed
                    </p>
                </div>
                {completedCount === goals.length && goals.length > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="p-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/50 text-yellow-400"
                    >
                        <Trophy className="w-4 h-4" />
                    </motion.div>
                )}
            </div>

            <div className="space-y-3 flex-1 relative z-10 overflow-y-auto pr-1">
                {loading ? (
                    <div className="flex items-center justify-center h-20">
                        <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {goals.map((goal, i) => (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ delay: i * 0.05 }}
                                className={`group relative p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${goal.completed
                                    ? 'bg-emerald-500/10 border-emerald-500/20'
                                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                                    }`}
                                onClick={() => toggleGoal(goal.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Interactive Progress Bar Background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                                <div className="relative flex items-center gap-3">
                                    <div className={`
                                        w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300
                                        ${goal.completed ? 'bg-emerald-500 border-emerald-500 scale-110' : 'border-white/20 group-hover:border-white/40'}
                                     `}>
                                        {goal.completed && (
                                            <motion.svg
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                className="w-3 h-3 text-black stroke-[3]"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </motion.svg>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm font-medium transition-colors ${goal.completed ? 'text-emerald-200 line-through opacity-70' : 'text-neutral-200'}`}>
                                                {goal.text}
                                            </span>
                                            <button
                                                onClick={(e) => deleteGoal(goal.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-neutral-500 hover:text-red-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        {!goal.completed && goal.target > 1 && (
                                            <div className="mt-1.5 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                                                    className={`h-full rounded-full bg-${goal.color}-500/70`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {isAdding ? (
                <form onSubmit={handleAddGoal} className="mt-4 animate-in slide-in-from-bottom-2">
                    <div className="flex gap-2">
                        <input
                            autoFocus
                            value={newGoalText}
                            onChange={(e) => setNewGoalText(e.target.value)}
                            placeholder="Type goal..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                        />
                        <button
                            type="submit"
                            className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="p-2 bg-white/5 text-neutral-400 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl transition-all group"
                >
                    Add New Goal
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            )}
        </div>
    );
}

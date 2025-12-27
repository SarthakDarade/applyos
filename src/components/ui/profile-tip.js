import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export function ProfileTip() {
    return (
        <div className="relative overflow-hidden group mb-8 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20 backdrop-blur-sm">
            {/* Shine Effect */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent z-0" />

            <div className="relative z-10 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <Sparkles className="w-5 h-5" />
                </div>

                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-0.5">Boost your results</h4>
                    <p className="text-sm text-neutral-400">
                        Maximize accuracy by keeping your <Link href="/profile" className="text-blue-400 hover:text-blue-300 transition-colors">Professional Profile</Link> up to date.
                    </p>
                </div>

                <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-sm font-medium text-white transition-all group/btn shrink-0"
                >
                    Update Profile
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}

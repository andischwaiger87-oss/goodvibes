import React, { useEffect, useMemo, useState } from 'react';
import VotingCard from '../components/VotingCard';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database, AlertTriangle, Vote, Clock, Target, ChevronDown } from 'lucide-react';
import { getDeviceId } from '../utils/security';
import { CardGridSkeleton } from '../components/Skeleton';
import { getCategoryLabel } from '../utils/categories';
import PageHeader from '../components/PageHeader';
import { cn } from '../utils/cn';

export default function Voting() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPhase, setCurrentPhase] = useState('submission');
    const [voteGoal, setVoteGoal] = useState(100);
    const [showHowTo, setShowHowTo] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('votes');

    useEffect(() => {
        fetchPhaseAndProjects();
    }, []);

    const fetchPhaseAndProjects = async () => {
        setLoading(true);
        try {
            // 1. Fetch current phase
            const { data: settings } = await supabase.from('app_settings').select('*');
            if (settings) {
                const phaseSetting = settings.find(s => s.key === 'current_phase');
                if (phaseSetting) {
                    setCurrentPhase(phaseSetting.value);
                }
                const goalSetting = settings.find(s => s.key === 'vote_goal');
                const goal = parseInt(goalSetting?.value, 10);
                if (goal > 0) setVoteGoal(goal);
            }

            // 2. Fetch projects (active + implementation + user rejected)
            const deviceId = getDeviceId();

            // Fetch active & implementation projects
            const { data: publicProjects, error: publicError } = await supabase
                .from('projects')
                .select('*')
                .in('status', ['active', 'implementation'])
                .order('votes', { ascending: false });

            if (publicError) throw publicError;

            // Fetch user's own rejected projects
            const { data: rejectedProjects, error: rejectedError } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'rejected')
                .eq('owner_id', deviceId);

            if (rejectedError) {
                console.error('Could not fetch rejected projects:', rejectedError);
            }

            // Combine: rejected first (for visibility), then active/implementation
            const allProjects = [
                ...(rejectedProjects || []),
                ...(publicProjects || [])
            ];

            setProjects(allProjects);
        } catch (err) {
            console.error('Error fetching voting data:', err);
            setError('Konnte Daten nicht laden.');
        } finally {
            setLoading(false);
        }
    };

    // Filter: nur Bereiche anzeigen, in denen es auch Ideen gibt
    const categories = useMemo(() => {
        const counts = {};
        projects.forEach((p) => { if (p.status !== 'rejected') counts[p.category] = (counts[p.category] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [projects]);

    const visible = useMemo(() => {
        const list = projects.filter((p) => filter === 'all' || p.category === filter || p.status === 'rejected');
        if (sort === 'new') {
            return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return list;
    }, [projects, filter, sort]);

    const handleVoteUpdate = (projectId) => {
        setProjects(prev => prev.map(p =>
            p.id === projectId ? { ...p, votes: (p.votes || 0) + 1 } : p
        ).sort((a, b) => {
            // Keep rejected at top, then sort by votes
            if (a.status === 'rejected' && b.status !== 'rejected') return -1;
            if (b.status === 'rejected' && a.status !== 'rejected') return 1;
            return b.votes - a.votes;
        }));
    };

    return (
        <div className="py-6 sm:py-14 max-w-7xl mx-auto">
            <PageHeader
                eyebrow="Abstimmung"
                title="Deine Stimme"
                highlight="zählt."
                text="Unterstütze die Idee, die dir am besten gefällt."
                className="!mb-0"
            />
            <div className="text-center mb-8 sm:mb-12">
                {currentPhase === 'review' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 sm:mt-8 flex items-start gap-3 p-4 sm:p-5 bg-white ring-1 ring-slate-200 rounded-2xl max-w-lg mx-auto text-left"
                    >
                        <span className="shrink-0 w-9 h-9 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                            <Clock className="w-[18px] h-[18px]" aria-hidden="true" />
                        </span>
                        <div>
                            <h3 className="font-semibold text-slate-900">Kurze Pause</h3>
                            <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                                Ich werte gerade die Stimmen aus. Abstimmen und Einreichen ist bald wieder möglich.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="mt-6 sm:mt-8 max-w-md mx-auto"
                    >
                        <button
                            type="button"
                            onClick={() => setShowHowTo((v) => !v)}
                            aria-expanded={showHowTo}
                            aria-controls="so-funktionierts"
                            className="group inline-flex items-center gap-2.5 min-h-[44px] pl-1.5 pr-4 rounded-full bg-white ring-1 ring-slate-200 shadow-sm text-sm whitespace-nowrap hover:ring-blue-200 transition-all"
                        >
                            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center shrink-0">
                                <Target className="w-4 h-4" aria-hidden="true" />
                            </span>
                            <span className="text-slate-700">Ab <strong className="font-semibold text-slate-900">{voteGoal} Stimmen</strong> wird umgesetzt</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform ${showHowTo ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>
                        <AnimatePresence initial={false}>
                            {showHowTo && (
                                <motion.div
                                    id="so-funktionierts"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <ol className="mt-3 p-4 rounded-2xl bg-white ring-1 ring-slate-200/80 text-left text-sm text-slate-600 space-y-2.5">
                                        {[
                                            'Du gibst einer Idee deine Stimme.',
                                            'Danach siehst du, wie viele Stimmen sie hat.',
                                            `Ab ${voteGoal} Stimmen setze ich sie um – ehrenamtlich, eine nach der anderen.`,
                                        ].map((t, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                                <span className="pt-0.5">{t}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {loading ? (
                <CardGridSkeleton count={6} />
            ) : projects.length > 0 ? (
                <div className="relative">
                    {/* ---------- Filter & Sortierung ---------- */}
                    <div className="mb-5 sm:mb-7 -mx-4 sm:mx-0">
                        <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Nach Bereich filtern">
                            {[['all', projects.filter((p) => p.status !== 'rejected').length], ...categories].map(([key, count]) => {
                                const active = filter === key;
                                return (
                                    <button
                                        key={key} type="button" onClick={() => setFilter(key)} aria-pressed={active}
                                        className={cn(
                                            'shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
                                            active
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                                                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-blue-200 hover:text-blue-700'
                                        )}
                                    >
                                        {key === 'all' ? 'Alle' : getCategoryLabel(key)}
                                        <span className={cn('text-xs tabular-nums', active ? 'text-white/75' : 'text-slate-400')}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-3 px-4 sm:px-0 flex items-center gap-1 text-sm" role="group" aria-label="Sortierung">
                            <span className="text-slate-400 mr-1">Sortieren:</span>
                            {[['votes', 'Beliebt'], ['new', 'Neu']].map(([key, label]) => (
                                <button
                                    key={key} type="button" onClick={() => setSort(key)} aria-pressed={sort === key}
                                    className={cn('min-h-[36px] px-3 rounded-full font-semibold transition-colors',
                                        sort === key ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800')}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Overlay block on voting dashboard during review phase */}
                    {currentPhase === 'review' && (
                        <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[2px] z-20 rounded-2xl pointer-events-none" />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
                        {visible.map((project) => (
                            <VotingCard 
                                key={project.id} 
                                project={project} 
                                onVote={handleVoteUpdate} 
                                isGlobalPhaseReview={currentPhase === 'review'}
                                voteGoal={voteGoal}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-3xl border border-slate-200/70 max-w-2xl mx-auto">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Noch keine Projekte</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Es wurden noch keine Ideen freigegeben. Sei der Erste!
                    </p>
                </div>
            )}
        </div>
    );
}
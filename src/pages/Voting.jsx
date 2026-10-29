import React, { useEffect, useState } from 'react';
import VotingCard from '../components/VotingCard';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database, AlertTriangle, Vote, Clock } from 'lucide-react';
import { getDeviceId } from '../utils/security';
import { CardGridSkeleton } from '../components/Skeleton';

export default function Voting() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPhase, setCurrentPhase] = useState('submission');

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
        <div className="py-6 sm:py-12 max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-14">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3 sm:mb-5"
                >
                    Deine Stimme zählt
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
                >
                    Welches Projekt findest du am besten? <br className="hidden sm:block" />
                    Entscheide mit, was wir als nächstes bauen.
                </motion.p>

                {currentPhase === 'review' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 sm:mt-8 inline-flex flex-col sm:flex-row items-center gap-3 p-5 sm:p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 max-w-2xl mx-auto text-left shadow-sm"
                    >
                        <Clock className="w-10 h-10 text-amber-500 shrink-0" />
                        <div>
                            <h3 className="font-bold text-base sm:text-lg mb-1">Abstimmungsrunde beendet (Sichtungsphase)</h3>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                Wir werten aktuell alle Stimmen aus und sichten die eingereichten Ideen für die nächste Phase. Während der Review-Phase sind Abstimmungen und neue Einreichungen kurzzeitig pausiert.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 sm:mt-8 inline-flex items-center gap-2.5 px-4 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl sm:rounded-full text-slate-600 text-sm text-left shadow-sm max-w-md sm:max-w-none"
                    >
                        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        <span className="text-balance sm:whitespace-nowrap">Das Ergebnis siehst du erst nach deiner Stimme – so bleibt es fair.</span>
                    </motion.div>
                )}
            </div>

            {loading ? (
                <CardGridSkeleton count={6} />
            ) : projects.length > 0 ? (
                <div className="relative">
                    {/* Overlay block on voting dashboard during review phase */}
                    {currentPhase === 'review' && (
                        <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[2px] z-20 rounded-2xl pointer-events-none" />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
                        {projects.map((project) => (
                            <VotingCard 
                                key={project.id} 
                                project={project} 
                                onVote={handleVoteUpdate} 
                                isGlobalPhaseReview={currentPhase === 'review'}
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
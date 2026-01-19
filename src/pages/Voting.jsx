import React, { useEffect, useState } from 'react';
import VotingCard from '../components/VotingCard';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from 'lucide-react';
import { getDeviceId } from '../utils/security';

export default function Voting() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);

        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            const deviceId = getDeviceId();

            // Fetch active projects (public) + rejected projects owned by this user
            const { data: activeProjects, error: activeError } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'active')
                .order('votes', { ascending: false });

            if (activeError) throw activeError;

            // Fetch user's own rejected projects
            const { data: rejectedProjects, error: rejectedError } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'rejected')
                .eq('owner_id', deviceId);

            if (rejectedError) {
                console.error('Could not fetch rejected projects:', rejectedError);
            }

            // Combine: rejected first (for visibility), then active
            const allProjects = [
                ...(rejectedProjects || []),
                ...(activeProjects || [])
            ];

            setProjects(allProjects);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Konnte Projekte nicht laden.');
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
        <div className="py-16 px-4">
            <div className="text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6"
                >
                    Deine Stimme zählt
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
                >
                    Welches Projekt findest du am besten? <br />
                    Entscheide mit, was wir als nächstes bauen.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg text-slate-600 text-sm"
                >
                    <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>
                    Hinweis: Du siehst das Ergebnis erst, nachdem du abgestimmt hast. So bleibt es fair.
                </motion.div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {projects.map((project) => (
                        <VotingCard key={project.id} project={project} onVote={handleVoteUpdate} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 max-w-2xl mx-auto">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Noch keine Projekte</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        {!isSupabaseConfigured()
                            ? "Die Datenbank ist noch nicht verbunden. Projekte werden angezeigt, sobald die Verbindung steht."
                            : "Es wurden noch keine Ideen freigegeben. Sei der Erste!"}
                    </p>
                    {!isSupabaseConfigured() && (
                        <div className="inline-block px-4 py-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                            Administrator Info: Bitte Supabase Keys in .env eintragen.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

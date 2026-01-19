import React, { useEffect, useState } from 'react';
import VotingCard from '../components/VotingCard';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from 'lucide-react';

export default function Voting() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);

        // Check if Supabase is connected
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return; // No Data (as requested: No Demo entries)
        }

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('votes', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
            // Silent error for UI, or show friendly message
            setError('Konnte Projekte nicht laden.');
        } finally {
            setLoading(false);
        }
    };

    const handleVoteUpdate = (projectId) => {
        // Optimistic update locally
        setProjects(prev => prev.map(p =>
            p.id === projectId ? { ...p, votes: (p.votes || 0) + 1 } : p
        ).sort((a, b) => b.votes - a.votes));
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

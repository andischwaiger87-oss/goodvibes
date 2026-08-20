import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Award, ArrowRight, Sparkles, ExternalLink, Heart } from 'lucide-react';
import { getCategoryLabel } from '../utils/categories';
import { projectAvatarUrl } from '../utils/avatar';
import { useSeo } from '../components/Seo';

export default function CompletedProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useSeo({
        title: 'Umgesetzte Projekte — GoodVibes',
        description: 'Alle Apps, die durch eure Ideen und Stimmen ausgewählt und kostenlos umgesetzt wurden. Direkt ausprobieren und Feedback geben.',
    });

    useEffect(() => {
        fetchCompletedProjects();
    }, []);

    const fetchCompletedProjects = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'completed')
                .order('created_at', { ascending: false });
            
            if (data) {
                setProjects(data);
            }
        } catch (err) {
            console.error("Error fetching completed projects:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            {/* Header */}
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 inline-flex items-center px-4 py-1.5 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm font-semibold gap-2"
                >
                    <Award className="w-4 h-4 text-yellow-600 animate-bounce" />
                    Showcase & Realisierte Apps
                </motion.div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Unsere umgesetzten Projekte
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Hier findest du alle Apps, die durch eure Ideen und Stimmen ausgewählt und von uns kostenlos realisiert wurden.
                </p>
            </div>

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="elgato-card overflow-hidden bg-white hover:border-yellow-300 hover:shadow-lg transition-all flex flex-col group relative"
                        >
                            {/* Decorative top border */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500" />
                            
                            <div className="p-6 sm:p-8 flex-grow">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded bg-yellow-50 text-yellow-700 border border-yellow-100">
                                        {getCategoryLabel(project.category)}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                        <Heart className="w-3.5 h-3.5 fill-current text-red-400" /> {project.votes} Stimmen
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-yellow-600 transition-colors">
                                    {project.title}
                                </h3>

                                {/* Einreicher mit Avatar – hilft beim Wiedererkennen */}
                                <div className="flex items-center gap-2.5 mb-4">
                                    <img
                                        src={projectAvatarUrl(project)}
                                        alt=""
                                        aria-hidden="true"
                                        className="w-9 h-9 rounded-full bg-gray-50 ring-1 ring-gray-200 shrink-0"
                                        loading="lazy"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Idee von <span className="font-bold text-slate-700">{project.username}</span>
                                    </p>
                                </div>
                                
                                <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-6 line-clamp-3">
                                    {project.description}
                                </p>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                                    <h4 className="text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Hauptnutzen:</h4>
                                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
                                        {project.benefit}
                                    </p>
                                </div>
                            </div>

                            <div className="px-5 py-4 sm:px-8 sm:py-5 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3 mt-auto">
                                {project.live_url && (
                                    <a
                                        href={project.live_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 px-5 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-4 focus:ring-slate-200"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        App öffnen <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                
                                <button
                                    onClick={() => navigate(`/projects/${project.slug || project.id}`)}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-white hover:bg-gray-50 text-slate-700 text-sm font-bold rounded-xl border border-gray-200 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-100"
                                >
                                    Details & Feedback <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 max-w-2xl mx-auto">
                    <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Noch keine realisierten Projekte</h3>
                    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                        Das erste Gewinnerprojekt der Community befindet sich aktuell in der aktiven Umsetzung. Sobald es fertiggestellt ist, findest du es hier samt Link und Feedback-Bereich!
                    </p>
                </div>
            )}
        </div>
    );
}

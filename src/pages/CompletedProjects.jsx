import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { ArrowRight, ExternalLink, Heart, Smartphone, Wrench } from 'lucide-react';
import { getCategoryLabel } from '../utils/categories';
import { projectAvatarUrl } from '../utils/avatar';
import { useSeo } from '../components/Seo';
import { CardGridSkeleton } from '../components/Skeleton';
import PageHeader from '../components/PageHeader';

export default function CompletedProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useSeo({
        title: 'Umgesetzte Projekte — GoodVibes',
        description: 'Alle Apps, die durch eure Ideen und Stimmen ausgewählt und gemeinnützig umgesetzt wurden. Direkt ausprobieren und Feedback geben.',
    });

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('status', 'completed')
                    .order('created_at', { ascending: false });
                if (data) setProjects(data);
            } catch (err) {
                console.error('Fehler beim Laden der Projekte:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="max-w-6xl mx-auto py-6 sm:py-14">
            <PageHeader
                eyebrow="Showcase"
                title="Aus Ideen"
                highlight="werden Apps."
                text="Diese Apps wurden von euch gewählt und gemeinnützig umgesetzt. Probier sie aus und sag mir, was du denkst."
            />

            {loading ? (
                <CardGridSkeleton count={2} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" />
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {projects.map((project, index) => {
                        const detailUrl = `/projects/${project.slug || project.id}`;
                        return (
                            <motion.article
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className="elgato-card group flex flex-col overflow-hidden"
                            >
                                {/* Kopf im Markenverlauf */}
                                <Link to={detailUrl} className="relative block overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-5 py-6 sm:px-7 sm:py-7 focus-visible:outline-none">
                                    <div aria-hidden="true" className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
                                    <div className="relative flex items-center gap-4">
                                        <span className="shrink-0 w-16 h-16 rounded-2xl bg-white shadow-lg shadow-indigo-900/20 flex items-center justify-center transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                                            <img src={projectAvatarUrl(project)} alt="" className="w-12 h-12" loading="lazy" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-2xl font-extrabold text-white tracking-tight leading-tight truncate">{project.title}</span>
                                            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-blue-50">
                                                <span className="inline-flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" aria-hidden="true" /> Fürs Handy</span>
                                                <span className="inline-flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" /> {project.votes} Stimmen</span>
                                            </span>
                                        </span>
                                    </div>
                                </Link>

                                <div className="p-5 sm:p-7 flex-grow">
                                    <p className="text-xs text-slate-500 mb-3">
                                        <span className="font-semibold text-blue-600">{getCategoryLabel(project.category)}</span>
                                        <span aria-hidden="true"> · </span>Idee von {project.username}
                                    </p>
                                    <p className="text-[15px] text-slate-600 leading-relaxed line-clamp-3">{project.description}</p>
                                </div>

                                <div className="px-5 pb-5 sm:px-7 sm:pb-7 flex flex-col sm:flex-row gap-3">
                                    {project.live_url && (
                                        <a
                                            href={project.live_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary flex-1 inline-flex items-center justify-center gap-2 min-h-[48px]"
                                        >
                                            App öffnen <ExternalLink className="w-4 h-4" aria-hidden="true" />
                                        </a>
                                    )}
                                    <Link to={detailUrl} className="btn-secondary flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px]">
                                        Mehr erfahren <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 px-6 max-w-lg mx-auto">
                    <span className="mx-auto mb-5 w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50 text-indigo-600 flex items-center justify-center">
                        <Wrench className="w-7 h-7" aria-hidden="true" />
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Die erste App entsteht gerade</h2>
                    <p className="text-slate-500 leading-relaxed">
                        Sobald sie fertig ist, findest du sie hier – mit Link und Feedback-Bereich.
                    </p>
                </div>
            )}
        </div>
    );
}

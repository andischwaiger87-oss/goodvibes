import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Wrench, Calendar, CheckCircle2, ChevronRight, Activity, Lightbulb } from 'lucide-react';
import { getCategoryLabel } from '../utils/categories';

export default function Progress() {
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchActiveProjectProgress();
    }, []);

    const fetchActiveProjectProgress = async () => {
        setLoading(true);
        try {
            // 1. Get active project ID from app settings
            const { data: settings } = await supabase.from('app_settings').select('*');
            const activeProjectSetting = settings?.find(s => s.key === 'active_project_id');
            const activeProjectId = activeProjectSetting ? activeProjectSetting.value : null;

            if (activeProjectId) {
                // 2. Fetch the project details
                const { data: projData } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', activeProjectId);

                if (projData && projData.length > 0) {
                    setProject(projData[0]);
                }

                // 3. Fetch project timeline updates
                const { data: updateData } = await supabase
                    .from('project_updates')
                    .select('*')
                    .eq('project_id', activeProjectId)
                    .order('created_at', { ascending: false });

                if (updateData) {
                    setUpdates(updateData);
                    // Set current progress based on latest update or default to 0
                    if (updateData.length > 0) {
                        setProgress(updateData[0].progress_percent);
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching progress details:", err);
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

    if (!project) {
        return (
            <div className="max-w-3xl mx-auto py-20 px-4 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Wrench className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Kein Projekt in Umsetzung</h1>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Aktuell wird kein Projekt aktiv entwickelt. Wir befinden uns in der Einreichungs- oder Voting-Phase. Stimme jetzt für dein Lieblingsprojekt ab!
                </p>
                <a href="/voting" className="btn-primary inline-flex items-center gap-2">
                    Zur Abstimmung <ChevronRight className="w-4 h-4" />
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            {/* Header */}
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold gap-2"
                >
                    <Activity className="w-4 h-4 animate-pulse text-indigo-500" />
                    Umsetzungs-Phase
                </motion.div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Projekt-Fortschritt
                </h1>
                <p className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Hier kannst du in Echtzeit verfolgen, wie wir die Gewinner-Idee der Community in Code verwandeln.
                </p>
            </div>

            {/* Project Overview Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="elgato-card p-5 sm:p-10 mb-12 bg-white relative overflow-hidden border-indigo-100 shadow-md"
            >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
                            {getCategoryLabel(project.category)}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">{project.title}</h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Eingereicht von <span className="font-semibold">{project.username}</span> • {project.votes} Stimmen erhalten
                        </p>
                    </div>
                </div>

                <p className="text-slate-600 mb-8 leading-relaxed text-sm sm:text-lg bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    {project.description}
                </p>

                {/* Progress bar */}
                <div>
                    <div className="flex justify-between items-center text-sm mb-2.5">
                        <span className="font-bold text-slate-700">Gesamt-Fortschritt</span>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">{progress}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Timeline updates */}
            <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    Entwicklungs-Tagebuch (Timeline)
                </h3>

                {updates.length > 0 ? (
                    <div className="relative border-l-2 border-indigo-100 ml-2 sm:ml-8 pl-6 sm:pl-10 space-y-12">
                        {updates.map((update, index) => (
                            <motion.div
                                key={update.id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                {/* Mobile-Fix: Vollautomatische Zentrierung des Timeline-Punkts auf der vertikalen Linie */}
                                <div className="absolute left-0 -translate-x-[calc(50%+1px)] top-6 w-5 h-5 rounded-full border-4 border-slate-50 bg-indigo-600 flex items-center justify-center shadow-sm z-10">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                </div>

                                <div className="elgato-card p-4 sm:p-6 bg-white hover:border-indigo-200 transition-colors shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                        <h4 className="text-base sm:text-lg font-bold text-slate-900">{update.update_title}</h4>
                                        <span className="text-[11px] sm:text-xs font-semibold text-slate-400 flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded w-fit">
                                            {new Date(update.created_at).toLocaleDateString('de-DE')}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-xs sm:text-base leading-relaxed whitespace-pre-wrap">
                                        {update.update_text}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="text-[11px] sm:text-xs text-indigo-600 font-semibold px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded">
                                            Status: {update.progress_percent}% fertiggestellt
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                        <Lightbulb className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Noch keine Updates verfasst.</p>
                        <p className="text-xs text-slate-400 mt-1">Sobald die Entwicklung startet, werden hier die ersten Berichte angezeigt.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Wrench, Activity, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichText from '../components/RichText';
import { getCategoryLabel } from '../utils/categories';

export default function Progress() {
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState(null); // Neu: Für die Mobile-Diagnose

    useEffect(() => {
        fetchActiveProjectProgress();
    }, []);

    const fetchActiveProjectProgress = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            // 1. Get active project ID from app settings
            const { data: settings, error: settingsError } = await supabase.from('app_settings').select('*');
            
            if (settingsError) {
                setErrorMessage(`Fehler beim Laden der Phasen-Einstellungen: ${settingsError.message}`);
                setLoading(false);
                return;
            }

            const activeProjectSetting = settings?.find(s => s.key === 'active_project_id');
            const activeProjectId = activeProjectSetting ? activeProjectSetting.value : null;

            if (activeProjectId) {
                // 2. Fetch the project details
                const { data: projData, error: projError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', activeProjectId);

                if (projError) {
                    setErrorMessage(`Fehler beim Laden des Projekts: ${projError.message}`);
                    setLoading(false);
                    return;
                }

                if (projData && projData.length > 0) {
                    setProject(projData[0]);
                } else {
                    setErrorMessage("Das aktive Projekt wurde in der Tabelle 'projects' nicht gefunden.");
                }

                // 3. Fetch project timeline updates
                const { data: updateData } = await supabase
                    .from('project_updates')
                    .select('*')
                    .eq('project_id', activeProjectId)
                    .order('created_at', { ascending: false });

                if (updateData) {
                    setUpdates(updateData);
                    if (updateData.length > 0) {
                        setProgress(updateData[0].progress_percent);
                    }
                }
            } else {
                // Wenn im Admin-Bereich die Phase zwar auf Umsetzung steht, aber kein Projekt im Dropdown gewählt wurde
                setProject(null);
            }
        } catch (err) {
            console.error("Error fetching progress details:", err);
            setErrorMessage(`Kritischer Netzwerk- oder CORS-Fehler: ${err.message || 'Verbindung abgebrochen'}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-100 border-t-indigo-600" role="status" aria-label="Lädt" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-6 sm:py-14">
            <PageHeader
                eyebrow="Fortschritt"
                title="Live dabei,"
                highlight="wie es entsteht."
                text="Hier siehst du, wie die gewählte Idee Schritt für Schritt zur App wird."
            />

            {/* Technischer Hinweis, falls Daten nicht geladen werden konnten (z. B. Werbeblocker) */}
            {errorMessage && (
                <div role="status" className="mb-8 flex items-start gap-3 p-4 rounded-2xl bg-white ring-1 ring-slate-200 text-sm text-slate-600">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="font-semibold text-slate-900">Daten konnten nicht geladen werden</p>
                        <p className="mt-0.5">Oft blockiert ein Werbe- oder Privatsphäre-Filter die Verbindung. Bitte lade die Seite neu oder deaktiviere den Filter kurz.</p>
                        <p className="mt-2 text-xs text-slate-400 font-mono break-all">{errorMessage}</p>
                    </div>
                </div>
            )}

            {project ? (
                <>
                    {/* Projekt + Fortschritt */}
                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 sm:p-10 shadow-xl shadow-indigo-500/20 mb-12 sm:mb-16"
                    >
                        <div aria-hidden="true" className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative">
                            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-white ring-1 ring-white/25 uppercase tracking-wider mb-4">
                                <Activity className="w-3.5 h-3.5" aria-hidden="true" /> In Umsetzung
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">{project.title}</h2>
                            <p className="mt-2 text-sm text-blue-50">
                                {getCategoryLabel(project.category)} · Idee von <span className="font-semibold text-white">{project.username}</span> · {project.votes} Stimmen
                            </p>

                            <div className="mt-8">
                                <div className="flex items-end justify-between mb-2.5">
                                    <span className="text-sm font-semibold text-blue-50">Fortschritt</span>
                                    <span className="text-3xl font-extrabold text-white tabular-nums">{progress}%</span>
                                </div>
                                <div className="h-3 rounded-full bg-white/20 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Fortschritt der Umsetzung">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.9, ease: 'easeOut' }}
                                        className="h-full rounded-full bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <section className="mb-12 sm:mb-16" aria-labelledby="idee-heading">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 mb-2">Die Idee</p>
                        <h2 id="idee-heading" className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4">Worum es geht</h2>
                        <RichText text={project.description} />
                    </section>

                    {/* Tagebuch */}
                    <section aria-labelledby="tagebuch-heading">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 mb-2">Tagebuch</p>
                        <h2 id="tagebuch-heading" className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6 sm:mb-8">Was zuletzt passiert ist</h2>

                        {updates.length > 0 ? (
                            <ol className="relative ml-3 border-l-2 border-indigo-100 space-y-8 sm:space-y-10">
                                {updates.map((update, index) => (
                                    <motion.li
                                        key={update.id || index}
                                        initial={{ opacity: 0, x: -12 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: Math.min(index, 4) * 0.06 }}
                                        className="relative pl-7 sm:pl-9"
                                    >
                                        <span aria-hidden="true" className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ring-4 ring-slate-50 ${index === 0 ? 'bg-gradient-to-br from-blue-600 to-violet-600' : 'bg-indigo-200'}`} />
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                                            <time className="text-xs font-semibold text-slate-400">{new Date(update.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{update.progress_percent}%</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1.5">{update.update_title}</h3>
                                        <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap max-w-[68ch]">{update.update_text}</p>
                                    </motion.li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-slate-500">Bald gibt es hier die ersten Einträge.</p>
                        )}
                    </section>
                </>
            ) : (
                <div className="text-center py-12 px-6 max-w-lg mx-auto">
                    <span className="mx-auto mb-5 w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50 text-indigo-600 flex items-center justify-center">
                        <Wrench className="w-7 h-7" aria-hidden="true" />
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Gerade wird nichts umgesetzt</h2>
                    <p className="text-slate-500 leading-relaxed">Sobald eine Idee in die Umsetzung geht, kannst du hier live mitverfolgen, wie sie entsteht.</p>
                </div>
            )}
        </div>
    );
}

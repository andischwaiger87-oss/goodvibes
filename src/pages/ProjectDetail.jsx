import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BugTracker from '../components/BugTracker';
import { motion } from 'framer-motion';
import {
    ArrowLeft, ExternalLink, Heart, Check, Sparkles, MessageSquare,
    ShieldCheck, Award, Code2
} from 'lucide-react';
import { getCategoryLabel } from '../utils/categories';
import { avatarUrl } from '../utils/avatar';
import { useSeo } from '../components/Seo';

export default function ProjectDetail() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchProjectDetails(); }, [id]);

    // Erkennt, ob die Adresse eine alte UUID oder einen sprechenden Slug enthält.
    const looksLikeUuid = (v) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''));

    const fetchProjectDetails = async () => {
        setLoading(true);
        try {
            // Erst über den sprechenden Slug versuchen …
            let found = null;
            if (!looksLikeUuid(id)) {
                const { data } = await supabase.from('projects').select('*').eq('slug', id);
                found = Array.isArray(data) ? data[0] : data;
            }
            // … sonst (oder als Rückfallebene) über die alte ID.
            if (!found) {
                const { data } = await supabase.from('projects').select('*').eq('id', id);
                found = Array.isArray(data) ? data[0] : data;
            }
            setProject(found || null);
        } catch (err) {
            console.error('Fehler beim Laden des Projekts:', err);
        } finally {
            setLoading(false);
        }
    };

    useSeo({
        title: project ? `${project.title} — Umgesetztes Projekt | GoodVibes` : undefined,
        description: project
            ? (project.description || '').replace(/\s+/g, ' ').trim().slice(0, 155)
            : undefined,
        noindex: !loading && !project ? true : undefined,
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" role="status" aria-label="Lädt" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="max-w-xl mx-auto py-20 px-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Projekt nicht gefunden</h1>
                <p className="text-slate-500 mb-6">Dieses Projekt gibt es nicht (mehr). Schau dich gerne im Showcase um.</p>
                <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Zurück zum Showcase
                </Link>
            </div>
        );
    }

    const featureList = (project.features || '')
        .split('\n')
        .map((f) => f.replace(/^[•\-\s*]+/, '').trim())
        .filter(Boolean);

    return (
        <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4">
            <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-5"
            >
                <ArrowLeft className="w-4 h-4" /> Alle umgesetzten Projekte
            </Link>

            {/* ---------- Kopfbereich ---------- */}
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-9 shadow-xl shadow-blue-500/20"
            >
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-indigo-300/20 blur-3xl" />
                </div>

                <div className="relative">
                    {/* Auszeichnungen */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-white text-blue-700 uppercase tracking-wider">
                            <Award className="w-3.5 h-3.5" /> Umgesetzt
                        </span>
                        <span className="inline-flex text-[11px] font-semibold px-3 py-1 rounded-full bg-white/15 text-white ring-1 ring-white/25">
                            {getCategoryLabel(project.category)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-white/15 text-white ring-1 ring-white/25">
                            <Heart className="w-3.5 h-3.5 fill-current" /> {project.votes} Stimmen
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        {project.title}
                    </h1>

                    {/* Einreicher mit Avatar */}
                    <div className="flex items-center gap-2.5 mt-4">
                        <img
                            src={avatarUrl(project.avatar_seed, project.id)}
                            alt=""
                            aria-hidden="true"
                            className="w-9 h-9 rounded-full bg-white ring-2 ring-white/40 shrink-0"
                            loading="lazy"
                        />
                        <p className="text-blue-50 text-sm">
                            Idee von <span className="font-bold text-white">{project.username}</span>
                        </p>
                    </div>

                    {/* Haupt-Aktion: auf dem Handy zuerst und gross */}
                    {project.live_url ? (
                        <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-extrabold text-base py-4 px-8 rounded-2xl shadow-lg shadow-blue-900/25 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-4 focus:ring-white/40"
                        >
                            <ExternalLink className="w-5 h-5" /> App jetzt öffnen
                        </a>
                    ) : (
                        <span className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 text-white/70 font-semibold py-4 px-8 rounded-2xl ring-1 ring-white/20">
                            Link in Kürze verfügbar
                        </span>
                    )}

                    <p className="text-blue-100/80 text-xs mt-3">
                        Kostenlos · Ohne Anmeldung · Ohne Werbung
                    </p>
                </div>
            </motion.header>

            {/* ---------- Vertrauens-Zeile ---------- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {[
                    { icon: Heart, title: '100 % gratis', desc: 'Ehrenamtlich umgesetzt, ohne Kosten.' },
                    { icon: ShieldCheck, title: 'Ohne Anmeldung', desc: 'Keine persönlichen Daten nötig.' },
                    { icon: Code2, title: 'Quelloffen', desc: 'MIT-Lizenz, Code ist einsehbar.' },
                ].map((item) => (
                    <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <item.icon className="w-4.5 h-4.5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm leading-tight">{item.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ---------- Beschreibung ---------- */}
            <section className="mt-8" aria-labelledby="worum-heading">
                <h2 id="worum-heading" className="text-lg font-bold text-slate-900 mb-3">Worum geht es?</h2>
                <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
                </div>
            </section>

            {/* ---------- Nutzen ---------- */}
            {project.benefit && (
                <section className="mt-6" aria-labelledby="nutzen-heading">
                    <h2 id="nutzen-heading" className="text-lg font-bold text-slate-900 mb-3">Wem hilft das?</h2>
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 sm:p-6">
                        <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{project.benefit}</p>
                    </div>
                </section>
            )}

            {/* ---------- Funktionen ---------- */}
            {featureList.length > 0 && (
                <section className="mt-6" aria-labelledby="funktionen-heading">
                    <h2 id="funktionen-heading" className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" /> Das kann die App
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {featureList.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2.5 bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
                                <span className="w-5 h-5 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                                    <Check className="w-3 h-3 text-green-600" />
                                </span>
                                <span className="text-sm text-slate-700 leading-relaxed">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* ---------- Zweiter Aufruf zur App ---------- */}
            {project.live_url && (
                <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 flex items-center justify-between gap-4 bg-slate-900 hover:bg-slate-800 transition-colors rounded-2xl p-5 sm:p-6 shadow-lg group"
                >
                    <span className="min-w-0">
                        <span className="block font-extrabold text-white text-base sm:text-lg leading-tight">
                            Lust, {project.title} auszuprobieren?
                        </span>
                        <span className="block text-slate-300 text-sm mt-0.5">
                            Öffnet sich direkt im Browser – ohne Installation.
                        </span>
                    </span>
                    <span className="shrink-0 inline-flex items-center gap-2 bg-white text-slate-900 font-bold text-sm py-3 px-5 rounded-xl group-hover:bg-blue-50 transition-colors">
                        Öffnen <ExternalLink className="w-4 h-4" />
                    </span>
                </a>
            )}

            {/* ---------- Feedback ---------- */}
            <section className="border-t border-gray-200 pt-10 mt-12" aria-labelledby="feedback-heading">
                <h2 id="feedback-heading" className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    Gemeinsam verbessern
                </h2>
                <p className="text-slate-500 text-sm sm:text-base max-w-2xl mb-8">
                    Etwas funktioniert nicht wie erwartet oder dir fehlt eine Funktion?
                    Schreib es hier hinein – anonym und ohne Anmeldung.
                </p>

                <BugTracker projectId={project.id} />
            </section>
        </div>
    );
}

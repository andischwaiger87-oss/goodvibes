import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BugTracker from '../components/BugTracker';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Heart, Check, HelpCircle, Activity, Sparkles, MessageSquare } from 'lucide-react';
import { getCategoryLabel } from '../utils/categories';

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id);

            if (data && data.length > 0) {
                setProject(data[0]);
            }
        } catch (err) {
            console.error("Error loading project details:", err);
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
            <div className="max-w-xl mx-auto py-20 px-4 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Projekt nicht gefunden</h2>
                <p className="text-slate-500 mb-6">Das angeforderte Projekt existiert nicht oder wurde entfernt.</p>
                <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Zurück zum Showcase
                </Link>
            </div>
        );
    }

    // Default features if none specified in DB
    const defaultFeatures = [
        "Einfache, barrierefreie Benutzeroberfläche für maximale Zugänglichkeit",
        "Keine Anmeldung oder E-Mail-Zwang zur Nutzung",
        "Optimiert für alle mobilen Endgeräte (iOS und Android)",
        "Open-Source Codebasis für Transparenz und Weiterentwicklung"
    ];

    const featureList = project.features
        ? project.features.split('\n').filter(f => f.trim())
        : defaultFeatures;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Back Button */}
            <div className="mb-8">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Zurück zum Showcase
                </Link>
            </div>

            {/* Main Showcase Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                {/* Details Left */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded bg-yellow-50 text-yellow-700 border border-yellow-100">
                            {getCategoryLabel(project.category)}
                        </span>
                        <span className="inline-flex text-xs font-bold px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider">
                            Realisiert
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        {project.title}
                    </h1>

                    <p className="text-slate-500 text-sm sm:text-base">
                        Vorgeschlagen von <span className="font-semibold">{project.username}</span> • {project.votes} Unterstützer-Stimmen in der Voting-Phase
                    </p>

                    <div className="prose max-w-none text-slate-600 leading-relaxed text-base sm:text-lg whitespace-pre-wrap bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                        {project.description}
                    </div>

                    {/* Features checklist */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            Highlights & Features
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {featureList.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                                    <div className="w-5 h-5 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span>{feature.replace(/^[•\-\s*]+/, '')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Sidebar Details Right */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-white p-8 rounded-2xl border border-indigo-950 shadow-lg relative overflow-hidden flex flex-col justify-between h-full min-h-[320px]">
                        {/* Background light shapes */}
                        <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xl font-bold mb-2">Projekt öffnen</h3>
                            <p className="text-sm text-indigo-200 leading-relaxed mb-6">
                                Dieses Projekt wurde komplett kostenlos, spendenfinanziert und quelloffen umgesetzt. Klicke auf den Button, um die fertige Anwendung direkt zu nutzen.
                            </p>
                            
                            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10 text-xs text-indigo-100">
                                <p className="flex justify-between"><span className="text-indigo-300">Entwickelt von:</span> <span>Andreas / mosaik</span></p>
                                <p className="flex justify-between"><span className="text-indigo-300">Lizenz:</span> <span>MIT (Open Source)</span></p>
                                <p className="flex justify-between"><span className="text-indigo-300">Kosten:</span> <span>100% Gratis</span></p>
                            </div>
                        </div>

                        {project.live_url ? (
                            <a
                                href={project.live_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 relative z-10 text-center text-sm uppercase tracking-wider mt-8 hover:-translate-y-0.5"
                            >
                                App starten <ExternalLink className="w-4 h-4" />
                            </a>
                        ) : (
                            <div className="w-full py-4 px-6 bg-white/10 text-white/60 font-semibold rounded-xl text-center text-sm mt-8 border border-white/5">
                                Link in Kürze verfügbar
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bug & Feedback Section */}
            <div className="border-t border-gray-200 pt-16 mt-16">
                <div className="mb-10 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 flex items-center justify-center sm:justify-start gap-2">
                        <MessageSquare className="w-7 h-7 text-indigo-600" />
                        Gemeinsam Verbessern
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base max-w-2xl">
                        Nutze diesen Bereich, um Feedback zu hinterlassen, Fragen zu stellen oder Fehler (Bugs) direkt an das Entwickler-Team zu melden.
                    </p>
                </div>

                <BugTracker projectId={project.id} />
            </div>
        </div>
    );
}

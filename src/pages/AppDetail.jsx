import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
    ArrowLeft, ExternalLink, FlaskConical, CheckCircle2, Sparkles,
    Info, ImageOff, ShieldCheck
} from 'lucide-react';
import { getAccent, averageRating } from '../utils/apps';
import { getCategoryLabel } from '../utils/categories';
import StarRating from '../components/StarRating';
import CommunityFeed from '../components/CommunityFeed';
import { cn } from '../utils/cn';

export default function AppDetail() {
    const { slug } = useParams();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchApp(); }, [slug]);

    const fetchApp = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.from('apps').select('*').eq('slug', slug);
            setApp(Array.isArray(data) ? data[0] : data);
        } catch (err) {
            console.error('Fehler beim Laden der App:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" role="status" aria-label="Lädt" />
            </div>
        );
    }

    if (!app) {
        return (
            <div className="max-w-2xl mx-auto text-center py-24 px-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-3">App nicht gefunden</h1>
                <p className="text-slate-500 mb-6">Diese App gibt es nicht (mehr). Schau dich gerne im App-Bereich um.</p>
                <Link to="/apps" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Zurück zum App-Bereich
                </Link>
            </div>
        );
    }

    const accent = getAccent(app.accent);
    const avg = averageRating(app);
    const features = (app.features || '').split('\n').map((f) => f.trim()).filter(Boolean);
    const screenshots = Array.isArray(app.screenshots) ? app.screenshots : [];

    return (
        <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4">
            <Link to="/apps" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Alle Apps
            </Link>

            {/* BETA-Hinweis-Banner */}
            {app.is_beta && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex items-start gap-3"
                    role="note"
                >
                    <FlaskConical className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                        <p className="font-bold text-amber-900 text-sm">Diese App ist in der Test-Phase (BETA)</p>
                        <p className="text-sm text-amber-800 leading-relaxed">
                            Das heißt: Die App ist neu und wird gerade ausprobiert. Es kann noch kleine Fehler geben.
                            Genau dafür sind wir hier – <strong>dein Feedback hilft uns</strong>, sie besser zu machen. Danke, dass du dabei bist!
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Kopfbereich */}
            <div className="elgato-card p-6 sm:p-8 relative overflow-hidden">
                <div className={cn('absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r', accent.ring)} />
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className={cn('shrink-0 w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-sm mx-auto sm:mx-0', accent.icon)} aria-hidden="true">
                        {app.icon_emoji || '📱'}
                    </div>

                    <div className="flex-grow min-w-0 text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{app.name}</h1>
                            {app.is_beta && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                                    <FlaskConical className="w-3 h-3" /> Beta
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 mt-1">{app.tagline}</p>

                        <div className="flex items-center gap-x-4 gap-y-2 flex-wrap mt-3 justify-center sm:justify-start text-sm text-slate-500">
                            <span className={cn('inline-flex px-2 py-0.5 rounded border font-medium', accent.soft)}>
                                {getCategoryLabel(app.category)}
                            </span>
                            {app.rating_count > 0 ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <StarRating value={avg} readOnly size="sm" showValue />
                                    <span className="text-slate-400">({app.rating_count} Bewertungen)</span>
                                </span>
                            ) : (
                                <span className="text-slate-400">Noch keine Bewertung</span>
                            )}
                            <span className="font-medium">Version {app.version}</span>
                        </div>

                        {/* Prominenter Öffnen-Button */}
                        <div className="mt-5">
                            {app.live_url ? (
                                <a
                                    href={app.live_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary inline-flex items-center gap-2 text-base py-3 px-8 shadow-lg shadow-blue-500/20"
                                >
                                    <ExternalLink className="w-5 h-5" /> App öffnen
                                </a>
                            ) : (
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 bg-gray-50 border border-gray-200 rounded-lg py-3 px-6">
                                    Bald verfügbar
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Umfang / Kurz-Infos */}
            {app.scope && (
                <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-2.5 text-sm text-slate-600 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{app.scope}</span>
                </div>
            )}

            {/* Beschreibung */}
            <section className="mt-8" aria-labelledby="beschreibung-heading">
                <h2 id="beschreibung-heading" className="text-lg font-bold text-slate-900 mb-3">Worum geht es?</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{app.description}</p>
            </section>

            {/* Funktionen */}
            {features.length > 0 && (
                <section className="mt-8" aria-labelledby="funktionen-heading">
                    <h2 id="funktionen-heading" className="text-lg font-bold text-slate-900 mb-3">Das kann die App</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2.5 bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                                <span className="text-sm text-slate-700 leading-relaxed">{f}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Was ist neu */}
            {app.whats_new && (
                <section className="mt-8" aria-labelledby="neu-heading">
                    <h2 id="neu-heading" className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" /> Was ist neu?
                    </h2>
                    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                        <p className="text-xs font-bold text-amber-700 mb-1">Version {app.version}</p>
                        {app.whats_new}
                    </div>
                </section>
            )}

            {/* Screenshots */}
            <section className="mt-8" aria-labelledby="bilder-heading">
                <h2 id="bilder-heading" className="text-lg font-bold text-slate-900 mb-3">Vorschau</h2>
                {screenshots.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
                        {screenshots.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`Bildschirmfoto ${i + 1} der App ${app.name}`}
                                className="h-72 rounded-xl border border-gray-200 shadow-sm snap-start shrink-0"
                                loading="lazy"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 text-sm text-slate-400 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5">
                        <ImageOff className="w-5 h-5" aria-hidden="true" />
                        Noch keine Vorschau-Bilder. Am schnellsten siehst du die App über „App öffnen".
                    </div>
                )}
            </section>

            {/* Info-Trenner */}
            <div className="mt-12 mb-6 flex items-center gap-3">
                <div className="h-px bg-gray-200 flex-grow" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 inline-flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> Austausch & Feedback
                </span>
                <div className="h-px bg-gray-200 flex-grow" />
            </div>

            {/* Community-Bereich (Forum / Chat) */}
            <CommunityFeed app={app} />
        </div>
    );
}

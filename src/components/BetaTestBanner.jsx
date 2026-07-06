import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, ExternalLink, MessageSquare, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * Moderner, prominenter Hinweis auf Apps in der Test-Phase (BETA).
 * Lädt die Beta-Apps automatisch – bleibt so auch für künftige Apps korrekt.
 */
export default function BetaTestBanner() {
    const [betaApps, setBetaApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const { data } = await supabase.from('apps').select('*');
                const betas = (data || [])
                    .filter((a) => a.is_beta && a.live_url)
                    .sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
                if (active) setBetaApps(betas);
            } catch {
                /* kein Hinweis, wenn nichts geladen werden kann */
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    if (loading || betaApps.length === 0) return null;

    const single = betaApps.length === 1 ? betaApps[0] : null;

    return (
        <section className="px-4 sm:px-0 pb-14" aria-labelledby="beta-heading">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-[28px] bg-slate-950 p-7 sm:p-10 shadow-xl shadow-slate-900/20 ring-1 ring-white/10"
            >
                {/* Glow-Hintergrund */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-blue-600/30 blur-3xl" />
                    <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-indigo-500/25 blur-3xl" />
                    <div className="absolute top-10 left-1/2 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* App-Icon-Kachel */}
                    <div className="shrink-0 mx-auto sm:mx-0">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-amber-400 opacity-70 blur-sm" />
                            <div className="relative w-20 h-20 rounded-3xl bg-slate-900 ring-1 ring-white/15 flex items-center justify-center text-4xl">
                                {single ? (single.icon_emoji || '🧪') : '🧪'}
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/30 uppercase tracking-wider mb-3">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-300" />
                            </span>
                            <FlaskConical className="w-3.5 h-3.5" /> Jetzt in der Test-Phase
                        </div>

                        {single ? (
                            <h2 id="beta-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                „{single.name}" ist bereit zum Testen.
                            </h2>
                        ) : (
                            <h2 id="beta-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                Neue Apps sind bereit zum Testen.
                            </h2>
                        )}

                        <p className="text-slate-300 mt-2 leading-relaxed max-w-2xl mx-auto sm:mx-0">
                            {single
                                ? 'Probier die App im echten Alltag aus und sag uns, was gut läuft und was noch fehlt. Dein Feedback macht sie besser – ganz anonym, ohne Anmeldung.'
                                : 'Probier die Test-Versionen aus und teile deine Meinung – ganz anonym. Deine Rückmeldung verbessert die Apps Schritt für Schritt.'}
                        </p>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                            {single ? (
                                <>
                                    <a
                                        href={single.live_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold py-3 px-6 rounded-xl shadow-lg shadow-black/20 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-4 focus:ring-white/30"
                                    >
                                        <ExternalLink className="w-5 h-5" /> „{single.name}" testen
                                    </a>
                                    <Link
                                        to={`/apps/${single.slug}`}
                                        className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3 px-6 rounded-xl ring-1 ring-white/20 hover:bg-white/15 transition-colors focus:outline-none focus:ring-4 focus:ring-white/20"
                                    >
                                        <MessageSquare className="w-5 h-5" /> Feedback geben
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/apps"
                                    className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold py-3 px-6 rounded-xl shadow-lg shadow-black/20 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-4 focus:ring-white/30"
                                >
                                    Zu den Test-Apps <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

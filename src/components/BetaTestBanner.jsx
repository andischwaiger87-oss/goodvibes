import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, ExternalLink, MessageSquare, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * Prominenter, markenkonformer Hinweis auf Apps in der Test-Phase (BETA).
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
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-7 sm:p-10 shadow-xl shadow-blue-500/20"
            >
                {/* Sanfte Glow-Flächen */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-20 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl" />
                    <div className="absolute top-6 left-1/3 w-56 h-56 rounded-full bg-amber-300/10 blur-3xl" />
                </div>

                <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* App-Icon-Kachel */}
                    <div className="shrink-0 mx-auto sm:mx-0">
                        <div className="w-20 h-20 rounded-3xl bg-white shadow-lg shadow-blue-900/20 ring-1 ring-white/50 flex items-center justify-center overflow-hidden">
                            <img
                                src="https://api.dicebear.com/7.x/bottts/svg?seed=avatar-5"
                                alt=""
                                aria-hidden="true"
                                className="w-16 h-16"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-white ring-1 ring-white/25 uppercase tracking-wider mb-3">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-80" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-300" />
                            </span>
                            <FlaskConical className="w-3.5 h-3.5" /> Jetzt in der Test-Phase
                        </div>

                        <h2 id="beta-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                            {single ? `„${single.name}" ist bereit zum Testen.` : 'Neue Apps sind bereit zum Testen.'}
                        </h2>

                        <p className="text-blue-50 mt-2 leading-relaxed max-w-2xl mx-auto sm:mx-0">
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
                                        className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-4 focus:ring-white/40"
                                    >
                                        <ExternalLink className="w-5 h-5" /> „{single.name}" testen
                                    </a>
                                    <Link
                                        to={`/apps/${single.slug}`}
                                        className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3 px-6 rounded-xl ring-1 ring-white/30 hover:bg-white/20 transition-colors focus:outline-none focus:ring-4 focus:ring-white/25"
                                    >
                                        <MessageSquare className="w-5 h-5" /> Feedback geben
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/apps"
                                    className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-4 focus:ring-white/40"
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

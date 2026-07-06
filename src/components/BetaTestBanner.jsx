import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, ExternalLink, MessageSquare, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * Prominenter Hinweis auf Apps, die gerade in der Test-Phase (BETA) sind.
 * Lädt die Beta-Apps automatisch – so bleibt der Hinweis auch korrekt,
 * wenn später weitere Apps in den Test gehen.
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
                /* still, kein Hinweis wenn nichts geladen werden kann */
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    if (loading || betaApps.length === 0) return null;

    const single = betaApps.length === 1 ? betaApps[0] : null;

    return (
        <section className="px-4 sm:px-0 pb-12 -mt-2" aria-labelledby="beta-heading">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-6 sm:p-8 shadow-sm"
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Icon / App-Symbol */}
                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-white border border-amber-100 shadow-sm flex items-center justify-center text-3xl mx-auto sm:mx-0" aria-hidden="true">
                        {single ? (single.icon_emoji || '🧪') : '🧪'}
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide mb-2">
                            <FlaskConical className="w-3.5 h-3.5" /> Jetzt in der Test-Phase
                        </div>

                        {single ? (
                            <>
                                <h2 id="beta-heading" className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                    „{single.name}" ist bereit zum Testen!
                                </h2>
                                <p className="text-slate-600 mt-1 leading-relaxed max-w-2xl">
                                    Probier die App im echten Alltag aus und sag uns, was gut läuft und was noch fehlt.
                                    Dein Feedback hilft direkt mit, sie besser zu machen – ganz anonym und ohne Anmeldung.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 id="beta-heading" className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Neue Apps sind bereit zum Testen!
                                </h2>
                                <p className="text-slate-600 mt-1 leading-relaxed max-w-2xl">
                                    Probier die Test-Versionen aus und teile deine Meinung – ganz anonym.
                                    Deine Rückmeldung hilft, die Apps Schritt für Schritt zu verbessern.
                                </p>
                            </>
                        )}

                        <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                            {single ? (
                                <>
                                    <a
                                        href={single.live_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary inline-flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-5 h-5" /> „{single.name}" testen
                                    </a>
                                    <Link
                                        to={`/apps/${single.slug}`}
                                        className="btn-secondary inline-flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-5 h-5" /> Feedback geben
                                    </Link>
                                </>
                            ) : (
                                <Link to="/apps" className="btn-primary inline-flex items-center justify-center gap-2">
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

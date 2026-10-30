import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCategoryLabel } from '../utils/categories';
import { projectAvatarUrl } from '../utils/avatar';

// Drei Tiere, die neugierig über den Rand der Liste schauen
const PEEKERS = [
    { src: '/avatars/peek-baer.svg', cls: 'w-[100px] sm:w-[120px] -rotate-6 translate-y-2', delay: 0 },
    { src: '/avatars/peek-koala.svg', cls: 'w-[112px] sm:w-[136px] z-10', delay: 0.15 },
    { src: '/avatars/peek-fuchs.svg', cls: 'w-[100px] sm:w-[120px] rotate-6 translate-y-1', delay: 0.3 },
];

/**
 * "Gerade in der Abstimmung" – die drei führenden Ideen, live aus der Datenbank.
 * Zeigt bewusst keine Stimmenzahlen (das Ergebnis sieht man erst nach der eigenen Stimme).
 */
export default function VotingPreview() {
    const reduce = useReducedMotion();
    const [ideas, setIdeas] = useState(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const { data } = await supabase
                    .from('projects')
                    .select('id, title, category, username, avatar_seed, live_url, votes')
                    .eq('status', 'active')
                    .order('votes', { ascending: false })
                    .limit(3);
                if (active) setIdeas(data || []);
            } catch {
                if (active) setIdeas([]);
            }
        })();
        return () => { active = false; };
    }, []);

    if (!ideas || ideas.length === 0) return null;

    return (
        <section className="pb-16 sm:pb-24 lg:pt-16" aria-labelledby="abstimmung-heading">
            <div className="text-center mb-6 sm:mb-8 px-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 mb-3">Gerade in der Abstimmung</p>
                <h2 id="abstimmung-heading" className="scroll-mt-28 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                    Diese Ideen brauchen dich.
                </h2>
            </div>

            <div className="max-w-xl mx-auto">
                {/* Tiere schauen über den Rand */}
                <div aria-hidden="true" className="relative flex justify-center items-end -space-x-6 sm:-space-x-7 -mb-[34px] sm:-mb-[40px] pointer-events-none select-none">
                    {PEEKERS.map((p) => (
                        <motion.img
                            key={p.src}
                            src={p.src}
                            alt=""
                            className={`relative ${p.cls} drop-shadow-sm`}
                            initial={reduce ? false : { y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ type: 'spring', stiffness: 220, damping: 18, delay: p.delay }}
                        />
                    ))}
                </div>

                {/* Liste */}
                <div className="relative z-10 bg-white rounded-3xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/60 overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                        {ideas.map((idea) => (
                            <li key={idea.id}>
                                <Link
                                    to="/voting"
                                    className="group flex items-center gap-4 px-4 sm:px-6 py-4 min-h-[76px] hover:bg-slate-50/80 transition-colors focus-visible:outline-none focus-visible:bg-blue-50/60"
                                >
                                    <img src={projectAvatarUrl(idea)} alt="" className="w-12 h-12 rounded-2xl bg-slate-50 ring-1 ring-slate-200 shrink-0" loading="lazy" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-bold text-slate-900 leading-snug line-clamp-2 sm:line-clamp-1">{idea.title}</span>
                                        <span className="block text-xs font-semibold text-blue-600 mt-0.5">{getCategoryLabel(idea.category)}</span>
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/voting" className="btn-primary inline-flex items-center justify-center gap-2 min-h-[52px] px-7 w-full sm:w-auto">
                        Jetzt abstimmen <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

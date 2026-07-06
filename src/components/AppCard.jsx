import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, FlaskConical } from 'lucide-react';
import { getAccent, averageRating } from '../utils/apps';
import { getCategoryLabel } from '../utils/categories';
import StarRating from './StarRating';
import { cn } from '../utils/cn';

/**
 * Eine App-Karte im Play-Store-Stil für die Übersicht.
 */
export default function AppCard({ app, index = 0, postCount = 0 }) {
    const accent = getAccent(app.accent);
    const avg = averageRating(app);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="h-full"
        >
            <Link
                to={`/apps/${app.slug}`}
                className="elgato-card group flex flex-col h-full p-5 sm:p-6 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
                aria-label={`${app.name} öffnen – Details und Community ansehen`}
            >
                <div className="flex items-start gap-4">
                    {/* App-Icon */}
                    <div className={cn('shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm', accent.icon)} aria-hidden="true">
                        <span>{app.icon_emoji || '📱'}</span>
                    </div>

                    <div className="min-w-0 flex-grow">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
                                {app.name}
                            </h3>
                            {app.is_beta && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                                    <FlaskConical className="w-3 h-3" /> Beta
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{app.tagline}</p>
                    </div>
                </div>

                {/* Meta-Zeile */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-slate-500">
                    <span className={cn('inline-flex px-2 py-0.5 rounded border font-medium', accent.soft)}>
                        {getCategoryLabel(app.category)}
                    </span>
                    {app.rating_count > 0 ? (
                        <span className="inline-flex items-center gap-1">
                            <StarRating value={avg} readOnly size="sm" />
                            <span className="font-semibold text-slate-600">{avg.toFixed(1)}</span>
                            <span className="text-slate-400">({app.rating_count})</span>
                        </span>
                    ) : (
                        <span className="text-slate-400">Noch keine Bewertung</span>
                    )}
                    <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> {postCount}
                    </span>
                    <span className="text-slate-400">Version {app.version}</span>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ansehen & mitreden <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}

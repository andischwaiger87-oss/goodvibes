import React from 'react';

/**
 * Lade-Platzhalter in Kartenform.
 * Zeigt schon beim Laden die spaetere Struktur – wirkt schneller und ruhiger
 * als ein Dreh-Kreis, und nichts "springt", wenn die Inhalte da sind.
 */
export function CardSkeleton() {
    return (
        <div className="elgato-card p-5 sm:p-6 animate-pulse" aria-hidden="true">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0" />
                <div className="flex-grow space-y-2 pt-1">
                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/3 bg-slate-100 rounded" />
                </div>
            </div>
            <div className="mt-5 space-y-2">
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-11/12 bg-slate-100 rounded" />
                <div className="h-3 w-4/5 bg-slate-100 rounded" />
            </div>
            <div className="mt-5 h-14 rounded-xl bg-slate-50 border border-slate-100" />
        </div>
    );
}

export function CardGridSkeleton({ count = 6, className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' }) {
    return (
        <div className={className} role="status" aria-label="Inhalte werden geladen">
            {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
            <span className="sr-only">Wird geladen …</span>
        </div>
    );
}

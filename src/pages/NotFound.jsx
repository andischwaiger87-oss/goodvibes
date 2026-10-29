import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { useSeo } from '../components/Seo';

export default function NotFound() {
    useSeo({ title: 'Seite nicht gefunden — GoodVibes', noindex: true });

    return (
        <div className="max-w-md mx-auto py-14 sm:py-20 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Compass className="w-7 h-7" aria-hidden="true" />
            </div>
            <p className="text-sm font-bold text-blue-600 mb-2">Fehler 404</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Diese Seite gibt es nicht
            </h1>
            <p className="text-slate-500 leading-relaxed mb-8">
                Vielleicht hat sich ein Tippfehler eingeschlichen oder die Seite ist umgezogen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Zur Startseite
                </Link>
                <Link to="/voting" className="btn-secondary inline-flex items-center justify-center">
                    Ideen ansehen
                </Link>
            </div>
        </div>
    );
}

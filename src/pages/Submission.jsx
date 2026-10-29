import React from 'react';
import { Lock, Heart, Clock } from 'lucide-react';
import Stepper from '../components/Stepper';

export default function Submission() {
    return (
        <div className="relative py-6 sm:py-12">
            {/* Sanfter Farbverlauf im Hintergrund */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-10 h-72 -z-10">
                <div className="absolute left-1/2 -translate-x-1/2 w-[38rem] max-w-full h-64 rounded-full bg-gradient-to-r from-blue-200/50 via-indigo-200/40 to-violet-200/50 blur-3xl" />
            </div>

            <header className="text-center mb-8 sm:mb-10 px-2">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-3">Mitmachen</p>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                    Teile deine <span className="text-gradient-flow">Idee</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                    Du hast eine Idee für eine App, die anderen hilft? In fünf kurzen Schritten ist sie eingereicht.
                </p>
                <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
                    <li className="inline-flex items-center gap-1.5"><Lock className="w-4 h-4 text-blue-600" aria-hidden="true" /> Anonym</li>
                    <li className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-600" aria-hidden="true" /> Ca. 3 Minuten</li>
                    <li className="inline-flex items-center gap-1.5"><Heart className="w-4 h-4 text-blue-600" aria-hidden="true" /> Kostenlos & ehrenamtlich</li>
                </ul>
            </header>

            <Stepper />
        </div>
    );
}

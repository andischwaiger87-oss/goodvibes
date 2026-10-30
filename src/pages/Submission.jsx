import React from 'react';
import { Lock, Heart, Clock } from 'lucide-react';
import Stepper from '../components/Stepper';
import PageHeader from '../components/PageHeader';

export default function Submission() {
    return (
        <div className="relative py-6 sm:py-12">
            {/* Sanfter Farbverlauf im Hintergrund */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-10 h-72 -z-10">
                <div className="absolute left-1/2 -translate-x-1/2 w-[38rem] max-w-full h-64 rounded-full bg-gradient-to-r from-blue-200/50 via-indigo-200/40 to-violet-200/50 blur-3xl" />
            </div>

            <PageHeader
                eyebrow="Mitmachen"
                title="Teile deine"
                highlight="Idee."
                text="Du hast eine Idee für eine Handy-App, die der Allgemeinheit hilft? In fünf kurzen Schritten ist sie eingereicht."
                className="!mb-8 sm:!mb-10"
            >
                <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
                    <li className="inline-flex items-center gap-1.5"><Lock className="w-4 h-4 text-blue-600" aria-hidden="true" /> Anonym</li>
                    <li className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-600" aria-hidden="true" /> Ca. 3 Minuten</li>
                    <li className="inline-flex items-center gap-1.5"><Heart className="w-4 h-4 text-blue-600" aria-hidden="true" /> Gemeinnützig</li>
                </ul>
            </PageHeader>

            <Stepper />
        </div>
    );
}

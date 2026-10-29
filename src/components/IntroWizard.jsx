import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Heart, ShieldCheck, Vote } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Import Supabase to check auth
import { getItem, setItem } from '../utils/storage';

const steps = [
    {
        icon: Heart,
        title: "Willkommen bei GoodVibes",
        text: "Wo 'Good' (Gutes tun) auf 'Vibes' (Vibe Coding mit KI) trifft. Wir verwandeln soziale Ideen mithilfe künstlicher Intelligenz in echte Anwendungen."
    },
    {
        icon: Vote,
        title: "Deine Meinung zählt!",
        text: "Reiche deine eigene Idee ein oder stimme für Projekte ab, die du wichtig findest. Die Community entscheidet."
    },
    {
        icon: ShieldCheck,
        title: "Sicher & Anonym",
        text: "Wir speichern keine persönlichen Daten. Deine Stimme zählt, aber deine Identität bleibt geheim."
    }
];

export default function IntroWizard() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const checkWizard = async () => {
            // 1. Check if user is logged in (Admin) -> Don't show wizard
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                return; // Admin doesn't need to see this
            }

            // In dieser Sitzung schon gesehen? Dann nicht erneut zeigen.
            if (getItem('gv_wizard_seen_session', 'session') === 'true') return;

            // 2. Visit Counter Logic: Show wizard every 3 visits
            const SHOW_EVERY_N_VISITS = 3;
            const visitCount = parseInt(getItem('gv_visit_count') || '0', 10);
            const newCount = visitCount + 1;
            setItem('gv_visit_count', newCount.toString());

            // Show on first visit, or every Nth visit
            if (newCount === 1 || newCount % SHOW_EVERY_N_VISITS === 0) {
                timer = setTimeout(() => setIsOpen(true), 1000);
            }
        };

        let timer;
        checkWizard();
        return () => clearTimeout(timer);
    }, []);

    // Escape schliesst, Seite dahinter scrollt nicht mit
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setItem('gv_wizard_seen_session', 'true', 'session');
    };

    if (!isOpen) return null;

    const CurrentIcon = steps[step].icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                /* SOTA Mobile-Fix: overflow-y-auto garantiert die Scrollbarkeit des gesamten Overlays auf kleinen Displays */
                className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm sm:p-4 overflow-y-auto"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="intro-titel"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative sm:my-auto pb-[env(safe-area-inset-bottom)]"
                >
                    {/* Griff-Leiste (nur Handy) */}
                    <div className="sm:hidden mx-auto mt-3 h-1.5 w-10 rounded-full bg-slate-200" aria-hidden="true" />
                    {/* Skip Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium px-3 min-h-[40px] bg-slate-50 rounded-xl border border-slate-100 z-10"
                    >
                        Überspringen
                    </button>

                    {/* Content */}
                    <div className="px-6 sm:px-8 pb-6 text-center pt-12">
                        <motion.div
                            key={step}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <CurrentIcon className="w-8 h-8" />
                            </div>
                            <h2 id="intro-titel" className="text-2xl font-bold text-slate-900 mb-3">{steps[step].title}</h2>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                {steps[step].text}
                            </p>
                        </motion.div>
                    </div>

                    {/* Footer / Controls */}
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 flex flex-col space-y-4">
                        <button
                            onClick={handleNext}
                            className="w-full btn-primary flex items-center justify-center min-h-[52px] text-base"
                        >
                            {step < steps.length - 1 ? 'Weiter' : 'Los geht\'s'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="flex justify-center space-x-2 pt-2" aria-label={`Schritt ${step + 1} von ${steps.length}`}>
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-200'}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
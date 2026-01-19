import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Heart, ShieldCheck, Zap } from 'lucide-react';

const steps = [
    {
        icon: Heart,
        title: "Willkommen bei GoodVibes",
        text: "Wo 'Good' (Gutes tun) auf 'Vibes' (Vibe Coding mit KI) trifft. Wir verwandeln soziale Ideen mithilfe künstlicher Intelligenz in echte Anwendungen."
    },
    {
        icon: Zap,
        title: "Du hast die Macht",
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
        // Session Storage: Zeigt den Wizard bei jedem neuen Tab/Browser-Start
        const hasSeenWizard = sessionStorage.getItem('gv_wizard_seen_session');
        if (!hasSeenWizard) {
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('gv_wizard_seen_session', 'true');
    };

    if (!isOpen) return null;

    const CurrentIcon = steps[step].icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
                >
                    {/* Skip Button (New) */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium px-3 py-1 bg-gray-50 rounded-lg border border-gray-100"
                    >
                        Überspringen
                    </button>

                    {/* Content */}
                    <div className="p-8 pb-6 text-center pt-12">
                        <motion.div
                            key={step}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                <CurrentIcon className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">{steps[step].title}</h2>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                {steps[step].text}
                            </p>
                        </motion.div>
                    </div>

                    {/* Footer / Controls */}
                    <div className="px-8 pb-8 pt-0 flex flex-col space-y-4">
                        <button
                            onClick={handleNext}
                            className="w-full btn-primary flex items-center justify-center"
                        >
                            {step < steps.length - 1 ? 'Weiter' : 'Los geht\'s'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="flex justify-center space-x-2 pt-2">
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

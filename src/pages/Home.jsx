import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Users, ShieldCheck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BetaTestBanner from '../components/BetaTestBanner';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Home() {
    const [currentPhase, setCurrentPhase] = useState('submission');

    useEffect(() => {
        const fetchPhase = async () => {
            const { data } = await supabase.from('app_settings').select('*');
            if (data) {
                const phaseSetting = data.find(s => s.key === 'current_phase');
                if (phaseSetting) {
                    setCurrentPhase(phaseSetting.value);
                }
            }
        };
        fetchPhase();
    }, []);

    // Bestimmt den Text basierend auf der globalen Phase
    const getPhaseBadgeText = () => {
        switch (currentPhase) {
            case 'review':
                return 'Abstimmungsrunde beendet';
            case 'implementation':
                return 'Wir setzen aktuell eine Idee um';
            case 'beta':
                return 'Beta-Test läuft – jetzt mittesten';
            case 'submission':
            default:
                return 'Wir sammeln jetzt Ideen';
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Hero Section */}
            <section className="text-center pt-8 pb-14 sm:py-16 lg:py-28 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 sm:mb-8 inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/80 backdrop-blur border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold shadow-sm shadow-blue-100"
                >
                    <span className="relative flex h-2.5 w-2.5 mr-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                    {getPhaseBadgeText()}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h1-hero mb-5 sm:mb-7 max-w-4xl mx-auto leading-[1.08] text-[2.15rem] sm:text-5xl md:text-6xl lg:text-7xl"
                >
                    Deine Idee für <br />
                    <span className="text-gradient-flow">ein besseres Miteinander.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-[1.05rem] sm:text-xl text-slate-600 mb-9 sm:mb-11 max-w-2xl mx-auto leading-relaxed px-1"
                >
                    GoodVibes hilft dir, soziale Projekte zu starten. Du hast die Idee, wir alle entscheiden gemeinsam – und ich setze die besten Vorschläge kostenlos um.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto"
                >
                    <Link to="/submission" className="btn-primary flex items-center justify-center text-base sm:text-lg min-h-[52px] px-7">
                        Idee vorschlagen <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link to="/voting" className="btn-secondary flex items-center justify-center text-base sm:text-lg min-h-[52px] px-7">
                        Abstimmung ansehen
                    </Link>
                </motion.div>

                <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="mt-7 sm:mt-9 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-500"
                    aria-label="Das Wichtigste auf einen Blick"
                >
                    {['100 % kostenlos', 'Anonym & ohne Anmeldung', 'Ohne Werbung'].map((t) => (
                        <li key={t} className="inline-flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" /> {t}
                        </li>
                    ))}
                </motion.ul>
            </section>

            {/* Hinweis auf Apps in der Test-Phase (BETA) */}
            <BetaTestBanner />

            {/* Feature Grid */}
            <motion.section
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-16 sm:pb-20"
            >
                <FeatureCard
                    icon={Lightbulb}
                    title="Einfach helfen"
                    desc="Im Mittelpunkt steht der gute Zweck. Mir geht es nicht um Gewinn, sondern darum, echte Probleme zu lösen."
                />
                <FeatureCard
                    icon={Users}
                    title="Gemeinsam entscheiden"
                    desc="Jede Stimme zählt gleich viel. Die Vorschläge mit dem meisten Zuspruch werden verwirklicht."
                />
                <FeatureCard
                    icon={ShieldCheck}
                    title="Sicher & Privat"
                    desc="Wir speichern keine persönlichen Daten von dir. Deine Privatsphäre bleibt geschützt."
                />
            </motion.section>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc }) {
    return (
        <motion.div variants={item} className="elgato-card p-6 sm:p-7 hover:border-blue-200 last:sm:col-span-2 last:lg:col-span-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-blue-100 rounded-2xl flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm sm:text-base">{desc}</p>
        </motion.div>
    );
}
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Users, ShieldCheck } from 'lucide-react';
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
        <div className="w-full">
            {/* Hero Section */}
            <section className="text-center py-12 lg:py-32 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold tracking-wide"
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
                    className="h1-hero mb-8 max-w-4xl mx-auto leading-tight text-3xl sm:text-5xl md:text-6xl"
                >
                    Deine Idee für <br />
                    <span className="text-blue-600">ein besseres Miteinander.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-base sm:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-normal px-2"
                >
                    GoodVibes hilft dir, soziale Projekte zu starten. Du hast die Idee, wir alle entscheiden gemeinsam – und ich setze die besten Vorschläge kostenlos um.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0"
                >
                    <Link to="/submission" className="btn-primary flex items-center justify-center text-lg shadow-blue-200 shadow-lg hover:shadow-xl hover:shadow-blue-200/50">
                        Idee vorschlagen <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link to="/voting" className="btn-secondary flex items-center justify-center text-lg">
                        Abstimmung ansehen
                    </Link>
                </motion.div>
            </section>

            {/* Hinweis auf Apps in der Test-Phase (BETA) */}
            <BetaTestBanner />

            {/* Feature Grid */}
            <motion.section
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pb-20 px-4 sm:px-0"
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
        <motion.div variants={item} className="elgato-card p-6 sm:p-8 hover:border-blue-400 transition-colors">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm sm:text-base">{desc}</p>
        </motion.div>
    );
}
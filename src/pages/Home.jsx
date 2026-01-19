import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Users, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="text-center py-20 lg:py-32 relative">
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
                    Wir sammeln jetzt Ideen
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h1-hero mb-8 max-w-4xl mx-auto leading-tight"
                >
                    Deine Idee für <br />
                    <span className="text-blue-600">ein besseres Miteinander.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-normal"
                >
                    GoodVibes hilft dir, soziale Projekte zu starten. Du hast die Idee, wir alle entscheiden gemeinsam – und setzen die besten Vorschläge kostenlos um.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row justify-center gap-4"
                >
                    <Link to="/submission" className="btn-primary flex items-center justify-center text-lg shadow-blue-200 shadow-lg hover:shadow-xl hover:shadow-blue-200/50">
                        Idee vorschlagen <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link to="/voting" className="btn-secondary flex items-center justify-center text-lg">
                        Abstimmung ansehen
                    </Link>
                </motion.div>
            </section>

            {/* Feature Grid */}
            <motion.section
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20"
            >
                <FeatureCard
                    icon={Lightbulb}
                    title="Einfach helfen"
                    desc="Im Mittelpunkt steht der gute Zweck. Uns geht es nicht um Gewinn, sondern darum, echte Probleme zu lösen."
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
        <motion.div variants={item} className="elgato-card p-8 hover:border-blue-400 transition-colors">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Icon className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed text-base">{desc}</p>
        </motion.div>
    );
}

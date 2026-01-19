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
                    className="mb-6 inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold tracking-wide"
                >
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Aktuelle Phase: Einreichung
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h1-hero mb-6 max-w-4xl mx-auto"
                >
                    Deine Idee für <br />
                    <span className="text-blue-600">eine bessere Welt.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    GoodVibes ist die Plattform für soziale Innovation. Reiche dein Non-Profit Projekt ein, die Community stimmt ab, und wir setzen es um. Kostenlos.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row justify-center gap-4"
                >
                    <Link to="/submission" className="btn-primary flex items-center justify-center text-lg">
                        Jetzt Idee einreichen <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link to="/voting" className="btn-secondary flex items-center justify-center text-lg">
                        Community Voting ansehen
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
                    title="Sinnvolle Innovation"
                    desc="Der Fokus liegt zu 100% auf sozialem Nutzen. Kein Profit, kein Tracking, nur echte Hilfe."
                />
                <FeatureCard
                    icon={Users}
                    title="Community Power"
                    desc="Demokratische Entscheidung. Die Ideen mit dem größten Rückhalt werden realisiert."
                />
                <FeatureCard
                    icon={Zap}
                    title="Professionelle Umsetzung"
                    desc="'AAA' Qualität für dein Projekt. Wir bauen skalierbare, sichere Web-Apps."
                />
            </motion.section>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc }) {
    return (
        <motion.div variants={item} className="elgato-card p-8 hover:border-blue-500/30">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

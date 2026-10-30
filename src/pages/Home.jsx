import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Users, ShieldCheck, Check, Smartphone, Heart, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BetaTestBanner from '../components/BetaTestBanner';
import VotingPreview from '../components/VotingPreview';

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
            <section className="isolate text-center pt-8 pb-14 sm:py-16 lg:pt-0 lg:pb-[14vh] lg:min-h-[calc(100svh-5rem)] lg:flex lg:flex-col lg:items-center lg:justify-center relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 sm:mb-8 inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-blue-100 text-blue-700 text-sm font-semibold shadow-sm shadow-blue-100"
                >
                    {/* Kleine Tier-Runde: zeigt freundlich, dass hier Menschen mitmachen */}
                    <span className="flex -space-x-2" aria-hidden="true">
                        {['tiere-0', 'tiere-18', 'tiere-9'].map((a) => (
                            <img key={a} src={`/avatars/${a}.svg`} alt="" className="w-7 h-7 rounded-full ring-2 ring-white bg-white" />
                        ))}
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
                    className="text-[1.05rem] sm:text-xl text-slate-600 mb-9 sm:mb-11 max-w-2xl mx-auto leading-relaxed px-1 text-balance"
                >
                    Hast du eine Idee für eine Handy-App, die vielen hilft? Wir stimmen gemeinsam ab – und ich setze sie{' '}
                    <span className="whitespace-nowrap">gemeinnützig und kostenlos um.</span>
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
                    className="mt-7 sm:mt-9 grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-x-4 gap-y-2.5 sm:gap-x-6 max-w-xs sm:max-w-none mx-auto text-left text-sm text-slate-500"
                    aria-label="Das Wichtigste auf einen Blick"
                >
                    {['Gemeinnützig', '100 % kostenlos', 'Fürs Handy gemacht', 'Ohne Anmeldung'].map((t) => (
                        <li key={t} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                            <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" /> {t}
                        </li>
                    ))}
                </motion.ul>

                {/* Dezente, unscharfe Herz-Kacheln im Hintergrund */}
                <HeartBackdrop />

                {/* Desktop: sanfter Hinweis, dass es weiter unten weitergeht */}
                <motion.a
                    href="#abstimmung-heading"
                    aria-label="Weiter nach unten"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 6, 0] }}
                    transition={{ opacity: { delay: 1 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
                    className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 w-10 h-10 items-center justify-center rounded-full text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <ChevronDown className="w-6 h-6" aria-hidden="true" />
                </motion.a>
            </section>

            {/* Hinweis auf Apps in der Test-Phase (BETA) */}
            <BetaTestBanner />

            {/* Live: die führenden Ideen, mit neugierigen Tieren */}
            <VotingPreview />

            {/* ---------- Warum GoodVibes ---------- */}
            <section className="pb-16 sm:pb-24 scroll-mt-24" aria-labelledby="warum-heading">
                <div className="text-center mb-8 sm:mb-12 px-2">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 mb-3">Warum GoodVibes</p>
                    <h2 id="warum-heading" className="scroll-mt-28 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        Mit Herz gemacht.
                    </h2>
                </div>

                <motion.ul
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
                >
                    <FeatureCard
                        icon={Heart} tone="rose"
                        title="Ohne Profit"
                        desc="Ich setze Ideen um, die vielen Menschen helfen – ehrenamtlich und ohne Werbung."
                    />
                    <FeatureCard
                        icon={Smartphone} tone="violet"
                        title="Fürs Handy gemacht"
                        desc="Dort, wo du sie im Alltag brauchst. Läuft direkt im Browser, ohne Installation."
                    />
                    <FeatureCard
                        icon={Users} tone="blue"
                        title="Gemeinsam entscheiden"
                        desc="Jede Stimme zählt gleich. Was die meisten wollen, wird gebaut."
                    />
                    <FeatureCard
                        icon={ShieldCheck} tone="emerald"
                        title="Sicher & privat"
                        desc="Keine Anmeldung, keine persönlichen Daten. Deine Privatsphäre bleibt bei dir."
                    />
                </motion.ul>

            </section>
        </div>
    );
}

const TONES = {
    rose: 'from-rose-50 to-orange-50 text-rose-500 ring-rose-100',
    violet: 'from-violet-50 to-fuchsia-50 text-violet-600 ring-violet-100',
    blue: 'from-blue-50 to-sky-50 text-blue-600 ring-blue-100',
    emerald: 'from-emerald-50 to-teal-50 text-emerald-600 ring-emerald-100',
};

function FeatureCard({ icon: Icon, title, desc, tone = 'blue' }) {
    return (
        <motion.li
            variants={item}
            className="group flex sm:flex-col items-start gap-4 sm:gap-5 p-5 sm:p-7 rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
        >
            <span className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ring-1 ${TONES[tone]} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                <Icon className="w-6 h-6" aria-hidden="true" />
            </span>
            <span>
                <span className="block text-base sm:text-lg font-bold text-slate-900 mb-1">{title}</span>
                <span className="block text-slate-500 leading-relaxed text-[15px]">{desc}</span>
            </span>
        </motion.li>
    );
}

// Position, Größe, Unschärfe und Deckkraft der Hintergrund-Herzen.
// Am Handy nur zwei, kleiner und weiter am Rand – damit der Text frei bleibt.
const HEARTS = [
    { pos: 'left-[-28px] top-[6%] sm:left-[4%] sm:top-[10%]', size: 'w-20 sm:w-28', blur: 'blur-[3px] sm:blur-[5px]', op: 'opacity-30', rot: '-rotate-12', dur: 9 },
    { pos: 'right-[-34px] top-[30%] sm:right-[5%] sm:top-[16%]', size: 'w-24 sm:w-36', blur: 'blur-[5px] sm:blur-[9px]', op: 'opacity-25 sm:opacity-30', rot: 'rotate-12', dur: 11 },
    { pos: 'hidden sm:block left-[11%] bottom-[16%]', size: 'w-20', blur: 'blur-[6px]', op: 'opacity-20', rot: 'rotate-6', dur: 10 },
    { pos: 'hidden sm:block right-[13%] bottom-[10%]', size: 'w-24', blur: 'blur-[10px]', op: 'opacity-20', rot: '-rotate-6', dur: 12 },
];

function HeartBackdrop() {
    const reduce = useReducedMotion();
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen -z-10 overflow-hidden">
            {HEARTS.map((h, i) => (
                <motion.div
                    key={i}
                    className={`absolute ${h.pos} ${h.size} ${h.blur} ${h.op}`}
                    animate={reduce ? undefined : { y: [0, -12, 0] }}
                    transition={{ duration: h.dur, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className={`aspect-square rounded-[30%] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ${h.rot}`}>
                        <Heart className="w-1/2 h-1/2 text-white fill-white" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

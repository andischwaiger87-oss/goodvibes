import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BugTracker from '../components/BugTracker';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    ArrowLeft, ExternalLink, Heart, Check, Sparkles, MessageSquare,
    ShieldCheck, Award, Code2
} from 'lucide-react';
import { getCategoryLabel } from '../utils/categories';
import { projectAvatarUrl } from '../utils/avatar';
import { useSeo } from '../components/Seo';

export default function ProjectDetail() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSticky, setShowSticky] = useState(false);
    const heroCtaRef = useRef(null);
    const reduce = useReducedMotion();

    useEffect(() => { fetchProjectDetails(); }, [id]);

    // Erkennt, ob die Adresse eine alte UUID oder einen sprechenden Slug enthält.
    const looksLikeUuid = (v) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''));

    const fetchProjectDetails = async () => {
        setLoading(true);
        try {
            // Erst über den sprechenden Slug versuchen …
            let found = null;
            if (!looksLikeUuid(id)) {
                const { data } = await supabase.from('projects').select('*').eq('slug', id);
                found = Array.isArray(data) ? data[0] : data;
            }
            // … sonst (oder als Rückfallebene) über die alte ID.
            if (!found) {
                const { data } = await supabase.from('projects').select('*').eq('id', id);
                found = Array.isArray(data) ? data[0] : data;
            }
            setProject(found || null);
        } catch (err) {
            console.error('Fehler beim Laden des Projekts:', err);
        } finally {
            setLoading(false);
        }
    };

    useSeo({
        title: project ? `${project.title} — Umgesetztes Projekt | GoodVibes` : undefined,
        description: project
            ? (project.description || '').replace(/\s+/g, ' ').trim().slice(0, 155)
            : undefined,
        noindex: !loading && !project ? true : undefined,
    });

    // Mobile Aktionsleiste einblenden, sobald der Hero-Button aus dem Bild scrollt
    useEffect(() => {
        const el = heroCtaRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;
        const io = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0));
        io.observe(el);
        return () => io.disconnect();
    }, [project]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" role="status" aria-label="Lädt" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="max-w-xl mx-auto py-20 px-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Projekt nicht gefunden</h1>
                <p className="text-slate-500 mb-6">Dieses Projekt gibt es nicht (mehr). Schau dich gerne im Showcase um.</p>
                <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Zurück zum Showcase
                </Link>
            </div>
        );
    }

    const featureList = (project.features || '')
        .split('\n')
        .map((f) => f.replace(/^[•\-\s*]+/, '').trim())
        .filter(Boolean);

    const trust = [
        { icon: Heart, title: 'Kostenlos', desc: 'Ehrenamtlich umgesetzt' },
        { icon: ShieldCheck, title: 'Ohne Anmeldung', desc: 'Keine persönlichen Daten' },
        { icon: Code2, title: 'Quelloffen', desc: 'MIT-Lizenz' },
    ];

    return (
        <div className="max-w-5xl mx-auto py-5 sm:py-10 pb-28 sm:pb-10">
            <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-2"
            >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Alle umgesetzten Projekte
            </Link>

            {/* ---------- Hero ---------- */}
            <motion.header
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-6 py-8 sm:p-12 shadow-xl shadow-indigo-500/20"
            >
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-28 -left-16 w-72 h-72 rounded-full bg-violet-300/25 blur-3xl" />
                </div>

                <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-white text-indigo-700 uppercase tracking-wider">
                                <Award className="w-3.5 h-3.5" aria-hidden="true" /> Umgesetzt
                            </span>
                            <span className="inline-flex text-[11px] font-semibold px-3 py-1 rounded-full bg-white/15 text-white ring-1 ring-white/25">
                                {getCategoryLabel(project.category)}
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
                            {project.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 text-sm text-blue-50">
                            <span className="inline-flex items-center gap-2">
                                <img
                                    src={projectAvatarUrl(project)}
                                    alt=""
                                    aria-hidden="true"
                                    className="w-8 h-8 rounded-full bg-white ring-2 ring-white/40 shrink-0"
                                    loading="lazy"
                                />
                                Idee von <span className="font-semibold text-white">{project.username}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
                                <span><span className="font-semibold text-white">{project.votes}</span> Stimmen aus der Community</span>
                            </span>
                        </div>

                        <div ref={heroCtaRef} className="mt-8">
                            {project.live_url ? (
                                <a
                                    href={project.live_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold text-base min-h-[56px] px-8 rounded-2xl shadow-lg shadow-indigo-900/25 hover:bg-blue-50 hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
                                >
                                    App jetzt öffnen <ExternalLink className="w-5 h-5" aria-hidden="true" />
                                </a>
                            ) : (
                                <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 text-white/80 font-semibold min-h-[56px] px-8 rounded-2xl ring-1 ring-white/25">
                                    Link in Kürze verfügbar
                                </span>
                            )}
                        </div>
                    </div>

                    {/* App-Symbol, nur auf grösseren Bildschirmen */}
                    <div aria-hidden="true" className="hidden sm:flex shrink-0 w-40 h-40 rounded-[2.25rem] bg-white/95 shadow-2xl shadow-indigo-900/30 ring-1 ring-white/60 items-center justify-center rotate-3">
                        <img src={projectAvatarUrl(project)} alt="" className="w-28 h-28" />
                    </div>
                </div>
            </motion.header>

            {/* ---------- Vertrauen: offen, ohne Kästen ---------- */}
            <ul className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-6 px-1 sm:px-4">
                {trust.map((t) => (
                    <li key={t.title} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <t.icon className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold text-slate-900 leading-tight">{t.title}</span>
                            <span className="hidden sm:block text-sm text-slate-500 mt-0.5">{t.desc}</span>
                        </span>
                    </li>
                ))}
            </ul>

            <div className="px-1 sm:px-4">
                {/* ---------- Beschreibung ---------- */}
                <Reveal as="section" className="mt-14 sm:mt-20" aria-labelledby="worum-heading">
                    <SectionHeading id="worum-heading" eyebrow="Die Idee" title="Worum geht es?" />
                    <RichText text={project.description} />
                </Reveal>

                {/* ---------- Nutzen: hervorgehoben, aber ohne Box ---------- */}
                {project.benefit && (
                    <Reveal as="section" className="mt-14 sm:mt-20" aria-labelledby="nutzen-heading">
                        <SectionHeading id="nutzen-heading" eyebrow="Der Nutzen" title="Wem hilft das?" />
                        <div className="relative pl-5 sm:pl-7">
                            <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                            <RichText text={project.benefit} tone="benefit" />
                        </div>
                    </Reveal>
                )}

                {/* ---------- Funktionen ---------- */}
                {featureList.length > 0 && (
                    <Reveal as="section" className="mt-14 sm:mt-20" aria-labelledby="funktionen-heading">
                        <SectionHeading id="funktionen-heading" eyebrow="Funktionen" title="Das kann die App" />
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 max-w-4xl">
                            {featureList.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                    </span>
                                    <span className="text-slate-700 leading-relaxed">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                )}
            </div>

            {/* ---------- Zweiter Aufruf zur App ---------- */}
            {project.live_url && (
                <Reveal className="mt-16 sm:mt-24">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-9 sm:p-12 text-center shadow-lg shadow-indigo-500/20">
                        <div aria-hidden="true" className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-white/10 blur-3xl" />
                        <Sparkles className="relative w-7 h-7 text-white/90 mx-auto mb-3" aria-hidden="true" />
                        <h2 className="relative text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Lust, {project.title} auszuprobieren?
                        </h2>
                        <p className="relative text-blue-100 mt-2">Öffnet sich direkt im Browser – ohne Installation.</p>
                        <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative mt-7 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold min-h-[52px] px-8 rounded-2xl hover:bg-blue-50 hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
                        >
                            App öffnen <ExternalLink className="w-4 h-4" aria-hidden="true" />
                        </a>
                    </div>
                </Reveal>
            )}

            {/* ---------- Feedback ---------- */}
            <section id="feedback" className="mt-16 sm:mt-24 px-1 sm:px-4 scroll-mt-24" aria-labelledby="feedback-heading">
                <SectionHeading id="feedback-heading" eyebrow="Mitmachen" title="Gemeinsam verbessern" />
                <p className="text-slate-600 max-w-2xl -mt-2 mb-8 leading-relaxed">
                    Etwas funktioniert nicht wie erwartet oder dir fehlt eine Funktion?
                    Schreib es hier hinein – anonym und ohne Anmeldung.
                </p>
                <BugTracker projectId={project.id} />
            </section>

            {/* ---------- Mobile: feste Aktionsleiste, sobald der Hero-Button weg ist ---------- */}
            <AnimatePresence>
                {project.live_url && showSticky && (
                    <motion.div
                        initial={reduce ? false : { y: 100 }}
                        animate={{ y: 0 }}
                        exit={reduce ? { opacity: 0 } : { y: 100 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        className="sm:hidden fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-xl border-t border-slate-200/70"
                    >
                        <div className="flex items-center gap-3">
                            <a
                                href="#feedback"
                                className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl text-slate-600 ring-1 ring-slate-200 bg-white"
                                aria-label="Zum Feedback"
                            >
                                <MessageSquare className="w-5 h-5" aria-hidden="true" />
                            </a>
                            <a
                                href={project.live_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary flex-1 inline-flex items-center justify-center gap-2 min-h-[48px]"
                            >
                                {project.title} öffnen <ExternalLink className="w-4 h-4" aria-hidden="true" />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/** Sanftes Einblenden beim Scrollen (respektiert „Bewegung reduzieren"). */
function Reveal({ as = 'div', children, className, ...rest }) {
    const reduce = useReducedMotion();
    const Comp = motion[as] || motion.div;
    return (
        <Comp
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={className}
            {...rest}
        >
            {children}
        </Comp>
    );
}

function SectionHeading({ id, eyebrow, title }) {
    return (
        <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 mb-2">{eyebrow}</p>
            <h2 id={id} className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        </div>
    );
}

/**
 * Wandelt einfachen Text aus der Datenbank in sauber gesetzte Absätze
 * und Aufzählungen um. Begrenzt die Zeilenlänge auf rund 70 Zeichen –
 * das ist die für Menschen angenehmste Lesebreite.
 */
function RichText({ text, tone = 'default' }) {
    const raw = String(text || '').replace(/\r\n/g, '\n').trim();
    if (!raw) return null;

    const bodyClass = tone === 'benefit' ? 'text-slate-700 text-base sm:text-lg' : 'text-slate-600';

    // In Blöcke teilen (Leerzeile = neuer Absatz)
    const blocks = raw.split(/\n\s*\n/);

    return (
        <div className={`max-w-[68ch] ${bodyClass} space-y-4 leading-[1.75]`}>
            {blocks.map((block, bi) => {
                const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
                const isList = lines.length > 1 && lines.every((l) => /^[•\-*]\s?/.test(l));

                // Reine Aufzählung
                if (isList) {
                    return (
                        <ul key={bi} className="space-y-2 pl-1">
                            {lines.map((l, li) => (
                                <li key={li} className="flex items-start gap-2.5">
                                    <span className="mt-[0.6em] w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />
                                    <span>{l.replace(/^[•\-*]\s?/, '')}</span>
                                </li>
                            ))}
                        </ul>
                    );
                }

                // Kurze Zeile ohne Satzzeichen am Ende = Zwischenüberschrift
                const isHeading =
                    lines.length === 1 &&
                    lines[0].length <= 60 &&
                    !/[.!?:,]$/.test(lines[0]) &&
                    blocks.length > 1;

                if (isHeading) {
                    return (
                        <h3 key={bi} className="text-base font-bold text-slate-900 pt-2">
                            {lines[0]}
                        </h3>
                    );
                }

                // Gemischter Block: normale Zeilen + evtl. Aufzählungspunkte
                return (
                    <div key={bi} className="space-y-2">
                        {lines.map((l, li) =>
                            /^[•\-*]\s?/.test(l) ? (
                                <div key={li} className="flex items-start gap-2.5 pl-1">
                                    <span className="mt-[0.6em] w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />
                                    <span>{l.replace(/^[•\-*]\s?/, '')}</span>
                                </div>
                            ) : (
                                <p key={li}>{l}</p>
                            )
                        )}
                    </div>
                );
            })}
        </div>
    );
}

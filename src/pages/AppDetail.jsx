import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
    ArrowLeft, ExternalLink, FlaskConical, Check, Sparkles,
    MessageSquare, Maximize2, ChevronRight, Star,
} from 'lucide-react';
import {
    averageRating, normalizeScreenshots, normalizeUseCases,
    screenshotAlt, screenshotFileName,
} from '../utils/apps';
import { getCategoryLabel } from '../utils/categories';
import CommunityFeed from '../components/CommunityFeed';
import Lightbox from '../components/Lightbox';
import { useSeo } from '../components/Seo';
import { COMMUNITY_AVATAR } from '../utils/avatar';
import { cn } from '../utils/cn';

/** Sanftes Einblenden beim Scrollen – entfaellt bei "weniger Bewegung". */
function Reveal({ children, className, delay = 0 }) {
    const reduce = useReducedMotion();
    if (reduce) return <div className={className}>{children}</div>;
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
        >
            {children}
        </motion.div>
    );
}

/** Einheitlicher Abschnittskopf: kleine Ueberzeile + klare Ueberschrift. */
function SectionHeading({ id, eyebrow, children }) {
    return (
        <div className="mb-6 sm:mb-8">
            {eyebrow && (
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-2">{eyebrow}</p>
            )}
            <h2 id={id} className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {children}
            </h2>
        </div>
    );
}

/** Platzhalter beim Laden – wirkt ruhiger als ein Dreh-Kreis. */
function DetailSkeleton() {
    return (
        <div className="max-w-5xl mx-auto py-5 sm:py-12 animate-pulse" role="status" aria-label="App wird geladen">
            <div className="h-4 w-24 bg-slate-200 rounded mb-6" />
            <div className="rounded-[2rem] bg-slate-200/80 h-80 sm:h-96" />
            <div className="mt-14 space-y-3 max-w-2xl">
                <div className="h-6 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-4 w-11/12 bg-slate-200 rounded" />
                <div className="h-4 w-4/5 bg-slate-200 rounded" />
            </div>
        </div>
    );
}

export default function AppDetail() {
    const { slug } = useParams();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null); // { shots, index }
    const [showStickyCta, setShowStickyCta] = useState(false);
    const heroRef = useRef(null);

    useEffect(() => { fetchApp(); }, [slug]);

    const fetchApp = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.from('apps').select('*').eq('slug', slug);
            setApp(Array.isArray(data) ? data[0] : data);
        } catch (err) {
            console.error('Fehler beim Laden der App:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handy: "App öffnen"-Leiste einblenden, sobald der Kopfbereich aus dem Bild ist
    useEffect(() => {
        const el = heroRef.current;
        if (!el || !('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver(([entry]) => setShowStickyCta(!entry.isIntersecting), { threshold: 0 });
        io.observe(el);
        return () => io.disconnect();
    }, [app]);

    useSeo({
        title: app ? `${app.name} — App & Community | GoodVibes` : undefined,
        description: app
            ? (app.tagline || app.description || '').replace(/\s+/g, ' ').trim().slice(0, 155)
            : undefined,
        noindex: !loading && !app ? true : undefined,
    });

    if (loading) return <DetailSkeleton />;

    if (!app) {
        return (
            <div className="max-w-2xl mx-auto text-center py-24">
                <h1 className="text-2xl font-bold text-slate-900 mb-3">App nicht gefunden</h1>
                <p className="text-slate-500 mb-6">Diese App gibt es nicht (mehr). Schau dich gerne im App-Bereich um.</p>
                <Link to="/apps" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Zurück zum App-Bereich
                </Link>
            </div>
        );
    }

    const avg = averageRating(app);
    const features = (app.features || '').split('\n').map((f) => f.trim()).filter(Boolean);
    const screenshots = normalizeScreenshots(app.screenshots);
    const useCases = normalizeUseCases(app.use_cases);
    const scopeItems = (app.scope || '').split('•').map((s) => s.trim()).filter(Boolean);
    const heroImage = useCases.find((u) => u.src) || screenshots[0] || null;

    const openShots = (shots, index) => setLightbox({ shots, index });
    const useCaseShots = useCases.filter((u) => u.src).map((u) => ({ src: u.src, alt: u.alt || u.title, name: u.title }));

    return (
        <div className="max-w-5xl mx-auto pt-4 pb-24 sm:pt-10 lg:pb-10">
            <Link
                to="/apps"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-5 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Alle Apps
            </Link>

            {/* ================= HERO ================= */}
            <header
                ref={heroRef}
                className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/20"
            >
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-white/15 blur-3xl" />
                    <div className="absolute -bottom-28 -left-16 w-72 h-72 rounded-full bg-violet-300/25 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:22px_22px] opacity-40" />
                </div>

                <div className={cn('relative grid gap-8 p-6 sm:p-10', heroImage && 'lg:grid-cols-[1.15fr_0.85fr] lg:items-center')}>
                    <div>
                        <div className="flex items-center gap-4">
                            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-lg shadow-indigo-900/20 flex items-center justify-center">
                                <img src={COMMUNITY_AVATAR} alt="" aria-hidden="true" className="w-12 h-12 sm:w-16 sm:h-16" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-none">{app.name}</h1>
                                    {app.is_beta && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-300 text-amber-950 uppercase tracking-wide">
                                            <FlaskConical className="w-3 h-3" aria-hidden="true" /> Beta
                                        </span>
                                    )}
                                </div>
                                <p className="text-blue-100 text-sm mt-2">
                                    {getCategoryLabel(app.category)} · Version {app.version}
                                </p>
                            </div>
                        </div>

                        {app.tagline && (
                            <p className="mt-6 text-xl sm:text-2xl font-semibold leading-snug text-white/95 max-w-xl text-balance">
                                {app.tagline}
                            </p>
                        )}

                        {/* Bewertung */}
                        <div className="mt-4 flex items-center gap-2 text-sm text-blue-50">
                            {app.rating_count > 0 ? (
                                <>
                                    <span className="inline-flex items-center gap-1 font-bold text-white">
                                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" aria-hidden="true" />
                                        {avg.toFixed(1)}
                                    </span>
                                    <span>aus {app.rating_count} {app.rating_count === 1 ? 'Bewertung' : 'Bewertungen'}</span>
                                </>
                            ) : (
                                <a href="#feedback" className="underline decoration-white/40 underline-offset-4 hover:decoration-white">
                                    Noch keine Bewertung – sei die erste Person!
                                </a>
                            )}
                        </div>

                        {/* Aktionen */}
                        <div className="mt-7 flex flex-col sm:flex-row gap-3">
                            {app.live_url ? (
                                <a
                                    href={app.live_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold text-base min-h-[52px] px-7 rounded-2xl shadow-lg shadow-indigo-900/25 hover:bg-blue-50 active:scale-[0.98] transition-all"
                                >
                                    App öffnen
                                    <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                                </a>
                            ) : (
                                <span className="inline-flex items-center justify-center min-h-[52px] px-7 rounded-2xl bg-white/10 ring-1 ring-white/25 text-white/80 font-semibold">
                                    Bald verfügbar
                                </span>
                            )}
                            <a
                                href="#feedback"
                                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-2xl bg-white/10 ring-1 ring-white/30 text-white font-semibold hover:bg-white/20 active:scale-[0.98] transition-all"
                            >
                                <MessageSquare className="w-5 h-5" aria-hidden="true" /> Feedback geben
                            </a>
                        </div>

                        {/* Kurz-Infos */}
                        {scopeItems.length > 0 && (
                            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-blue-50" aria-label="Auf einen Blick">
                                {scopeItems.map((item) => (
                                    <li key={item} className="inline-flex items-center gap-1.5">
                                        <Check className="w-4 h-4 text-emerald-300" aria-hidden="true" /> {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Vorschaubild im Hero (Desktop) */}
                    {heroImage && (
                        <div className="hidden lg:flex justify-center">
                            <img
                                src={heroImage.src}
                                alt={heroImage.alt || heroImage.title || `Vorschau der App ${app.name}`}
                                className="max-h-[420px] w-auto object-contain drop-shadow-2xl rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* BETA-Hinweis */}
            {app.is_beta && (
                <p role="note" className="mt-4 flex items-start gap-2.5 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                    <FlaskConical className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                        <strong>Test-Phase:</strong> Die App ist neu und kann noch kleine Fehler haben.
                        Dein Feedback hilft, sie besser zu machen.
                    </span>
                </p>
            )}

            {/* ================= WORUM GEHT ES ================= */}
            {app.description && (
                <Reveal className="mt-14 sm:mt-20">
                    <section aria-labelledby="beschreibung-heading" className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
                        <SectionHeading id="beschreibung-heading" eyebrow="Die Idee">Worum geht es?</SectionHeading>
                        <p className="text-lg text-slate-600 leading-[1.75] max-w-[65ch] whitespace-pre-wrap lg:pt-7">
                            {app.description}
                        </p>
                    </section>
                </Reveal>
            )}

            {/* ================= EINSATZBEISPIELE ================= */}
            {useCases.length > 0 && (
                <section aria-labelledby="beispiele-heading" className="mt-16 sm:mt-24">
                    <Reveal>
                        <SectionHeading id="beispiele-heading" eyebrow="Im Alltag">So hilft {app.name}</SectionHeading>
                    </Reveal>
                    <div className="space-y-12 sm:space-y-20">
                        {useCases.map((uc, i) => {
                            const imgIndex = useCaseShots.findIndex((s) => s.src === uc.src);
                            return (
                                <Reveal key={i}>
                                    <article className="grid items-center gap-6 sm:gap-10 md:grid-cols-2">
                                        {uc.src && (
                                            <button
                                                type="button"
                                                onClick={() => openShots(useCaseShots, imgIndex)}
                                                className={cn(
                                                    'group relative rounded-[1.75rem] bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 ring-1 ring-indigo-100/70 p-6 sm:p-10 flex items-center justify-center overflow-hidden',
                                                    i % 2 === 1 && 'md:order-2'
                                                )}
                                                aria-label={`${uc.alt || uc.title || 'Beispielbild'} – groß ansehen`}
                                            >
                                                <div aria-hidden="true" className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-indigo-200/40 blur-3xl" />
                                                <img
                                                    src={uc.src}
                                                    alt={uc.alt || uc.title || ''}
                                                    loading="lazy"
                                                    className="relative max-h-[380px] w-auto object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.03]"
                                                />
                                            </button>
                                        )}
                                        <div className={cn(!uc.src && 'md:col-span-2')}>
                                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-600/20 mb-4">
                                                {i + 1}
                                            </span>
                                            {uc.title && (
                                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3 text-balance">{uc.title}</h3>
                                            )}
                                            {uc.text && (
                                                <p className="text-slate-600 leading-relaxed text-base sm:text-lg max-w-[52ch]">{uc.text}</p>
                                            )}
                                        </div>
                                    </article>
                                </Reveal>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ================= FUNKTIONEN ================= */}
            {features.length > 0 && (
                <Reveal className="mt-16 sm:mt-24">
                    <section aria-labelledby="funktionen-heading">
                        <SectionHeading id="funktionen-heading" eyebrow="Funktionen">Das kann die App</SectionHeading>
                        <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                            {features.map((f, i) => (
                                <li key={i} className="flex items-start gap-3.5">
                                    <span className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                    </span>
                                    <span className="text-slate-700 leading-relaxed">{f}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </Reveal>
            )}

            {/* ================= VORSCHAU ================= */}
            {screenshots.length > 0 && (
                <Reveal className="mt-16 sm:mt-24">
                    <section aria-labelledby="bilder-heading">
                        <div className="flex items-end justify-between gap-4">
                            <SectionHeading id="bilder-heading" eyebrow="Einblicke">So sieht es aus</SectionHeading>
                            <p className="sm:hidden text-xs text-slate-400 mb-8 inline-flex items-center gap-1 shrink-0">
                                Wischen <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </p>
                        </div>
                        <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-px-4 [scrollbar-width:thin]">
                            {screenshots.map((shot, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => openShots(screenshots, i)}
                                    className="group relative shrink-0 snap-start rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                    aria-label={`${screenshotAlt(app, shot, i)} – groß ansehen`}
                                >
                                    <img
                                        src={shot.src}
                                        alt={screenshotAlt(app, shot, i)}
                                        title={screenshotFileName(app, shot, i)}
                                        className="h-80 sm:h-96 w-auto object-cover"
                                        loading="lazy"
                                    />
                                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur text-slate-700 text-xs font-semibold px-2.5 py-1 shadow-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 transition-all" aria-hidden="true">
                                        <Maximize2 className="w-3.5 h-3.5" /> Vergrößern
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                </Reveal>
            )}

            {/* ================= WAS IST NEU ================= */}
            {app.whats_new && (
                <Reveal className="mt-16 sm:mt-24">
                    <section aria-labelledby="neu-heading" className="relative pl-5 sm:pl-6">
                        <span aria-hidden="true" className="absolute left-[-2px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-indigo-500 to-violet-500 rounded-full" />
                        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-2">
                            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Neu in Version {app.version}
                        </p>
                        <h2 id="neu-heading" className="sr-only">Was ist neu?</h2>
                        <p className="text-slate-700 leading-relaxed max-w-[65ch]">{app.whats_new}</p>
                    </section>
                </Reveal>
            )}

            {/* ================= FEEDBACK ================= */}
            <section id="feedback" aria-labelledby="feedback-heading" className="mt-16 sm:mt-24 scroll-mt-28">
                <Reveal>
                    <SectionHeading id="feedback-heading" eyebrow="Austausch & Feedback">Was meinst du?</SectionHeading>
                </Reveal>
                <CommunityFeed app={app} />
            </section>

            {/* ================= HANDY: Aktionsleiste ================= */}
            {app.live_url && (
                <div
                    className={cn(
                        'lg:hidden fixed inset-x-0 bottom-0 z-30 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-xl border-t border-slate-200/70 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.18)] transition-transform duration-300',
                        showStickyCta ? 'translate-y-0' : 'translate-y-full'
                    )}
                    aria-hidden={!showStickyCta}
                >
                    <div className="max-w-5xl mx-auto flex items-center gap-3">
                        <img src={COMMUNITY_AVATAR} alt="" aria-hidden="true" className="w-10 h-10 rounded-xl bg-slate-50 ring-1 ring-slate-200 shrink-0" />
                        <div className="min-w-0 flex-grow">
                            <p className="font-bold text-slate-900 leading-tight truncate">{app.name}</p>
                            <p className="text-xs text-slate-500 truncate">Kostenlos · ohne Anmeldung</p>
                        </div>
                        <a
                            href={app.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={showStickyCta ? 0 : -1}
                            className="btn-primary inline-flex items-center gap-1.5 px-5 text-sm shrink-0"
                        >
                            Öffnen <ExternalLink className="w-4 h-4" aria-hidden="true" />
                        </a>
                    </div>
                </div>
            )}

            {lightbox && lightbox.shots.length > 0 && (
                <Lightbox
                    shots={lightbox.shots}
                    startIndex={Math.max(0, lightbox.index)}
                    app={app}
                    onClose={() => setLightbox(null)}
                />
            )}
        </div>
    );
}

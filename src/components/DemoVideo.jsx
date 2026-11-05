import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, ThumbsUp, Share2, Lightbulb } from 'lucide-react';

/**
 * "In 30 Sekunden erklärt" – kurzer Clip der App am Handy.
 * - Video liegt lokal (kein Drittanbieter), lädt erst in der Nähe des Bildschirms.
 * - Desktop: startet automatisch (ohne Ton), sobald sichtbar.
 * - Handy & "Bewegung reduzieren": nur Standbild, Start per Antippen (spart Daten).
 */
export default function DemoVideo() {
    const ref = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [src, setSrc] = useState(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') { setSrc('/videos/goodvibes-demo.mp4'); return; }
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const desktop = window.matchMedia?.('(min-width: 768px)').matches;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                setSrc('/videos/goodvibes-demo.mp4');
                if (desktop && !reduce) el.play?.().catch(() => {});
            } else if (!el.paused) {
                el.pause();
            }
        }, { rootMargin: '200px' });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const toggle = () => {
        const el = ref.current;
        if (!el) return;
        if (!src) setSrc('/videos/goodvibes-demo.mp4');
        if (el.paused) el.play?.().catch(() => {}); else el.pause();
    };

    const steps = [
        { icon: ThumbsUp, title: 'Abstimmen', text: 'Gib der Idee deine Stimme, die dir am besten gefällt.' },
        { icon: Share2, title: 'Teilen', text: 'Erzähl Familie, Verein und Freunden davon.' },
        { icon: Lightbulb, title: 'Einreichen', text: 'Du hast selbst eine Idee? In fünf Schritten ist sie da.' },
    ];

    return (
        <section aria-labelledby="demo-heading" className="mb-12 sm:mb-16">
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10 p-6 sm:p-8 rounded-[2rem] bg-white ring-1 ring-slate-200/70 shadow-sm">
                <div className="flex-1 min-w-0 order-2 sm:order-1 w-full">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-2">Video</p>
                    <h2 id="demo-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">In 30 Sekunden erklärt</h2>
                    <ul className="mt-5 space-y-4">
                        {steps.map((s) => (
                            <li key={s.title} className="flex items-start gap-3">
                                <span className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 text-indigo-600 flex items-center justify-center">
                                    <s.icon className="w-[18px] h-[18px]" aria-hidden="true" />
                                </span>
                                <span>
                                    <span className="block font-semibold text-slate-900">{s.title}</span>
                                    <span className="block text-sm text-slate-500 leading-relaxed">{s.text}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="order-1 sm:order-2 shrink-0 w-[220px] sm:w-[240px]">
                    <button
                        type="button"
                        onClick={toggle}
                        className="group relative block w-full rounded-[2rem] border-[6px] border-white bg-slate-50 overflow-hidden shadow-xl shadow-indigo-900/15 ring-1 ring-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                        aria-label={playing ? 'Video pausieren' : 'Video abspielen: GoodVibes am Handy'}
                    >
                        <video
                            ref={ref}
                            src={src || undefined}
                            poster="/videos/goodvibes-demo-poster.webp"
                            width="720" height="1558"
                            muted loop playsInline preload="none"
                            onPlay={() => setPlaying(true)}
                            onPause={() => setPlaying(false)}
                            className="block w-full h-auto aspect-[720/1558]"
                            aria-hidden="true"
                        />
                        <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                            <span className="w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-indigo-600">
                                {playing ? <Pause className="w-6 h-6" aria-hidden="true" /> : <Play className="w-6 h-6 ml-0.5" aria-hidden="true" />}
                            </span>
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
}

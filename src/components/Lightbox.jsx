import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { screenshotAlt, screenshotFileName } from '../utils/apps';

/**
 * Barrierefreie, stabile Bild-Lightbox.
 * - Funktioniert auf Desktop (Tastatur: ←/→/Esc) und Smartphone (Wischen, große Tap-Ziele)
 * - Sperrt das Scrollen im Hintergrund, während sie offen ist
 * - Nutzt den pflegbaren Alt-Text als Bildunterschrift und für den Datei-/Download-Namen
 */
export default function Lightbox({ shots, startIndex = 0, app, onClose }) {
    const [index, setIndex] = useState(startIndex);
    const touchX = useRef(null);
    const closeBtnRef = useRef(null);

    const count = shots.length;
    const shot = shots[index];

    const go = useCallback((dir) => {
        setIndex((i) => (i + dir + count) % count);
    }, [count]);

    // Tastatursteuerung
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowRight' && count > 1) go(1);
            else if (e.key === 'ArrowLeft' && count > 1) go(-1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [go, onClose, count]);

    // Hintergrund-Scroll sperren + Fokus auf Schließen-Button
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeBtnRef.current?.focus();
        return () => { document.body.style.overflow = prev; };
    }, []);

    const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
        if (touchX.current == null || count < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
    };

    const alt = screenshotAlt(app, shot, index);
    const fileName = screenshotFileName(app, shot, index);

    return createPortal(
        <AnimatePresence>
            <motion.div
                key="lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[100] bg-slate-950/92 backdrop-blur-sm flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label={`Bild ${index + 1} von ${count}: ${alt}`}
                onClick={onClose}
            >
                {/* Kopfzeile */}
                <div className="flex items-center justify-between p-4 text-white/90 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm font-medium tabular-nums">{index + 1} / {count}</span>
                    <div className="flex items-center gap-1">
                        <a
                            href={shot.src}
                            download={fileName}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
                            aria-label="Bild herunterladen"
                            title={fileName}
                        >
                            <Download className="w-5 h-5" />
                        </a>
                        <button
                            ref={closeBtnRef}
                            onClick={onClose}
                            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label="Schließen"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Bildbereich */}
                <div
                    className="flex-grow flex items-center justify-center px-2 sm:px-16 pb-4 min-h-0"
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    {count > 1 && (
                        <button
                            onClick={() => go(-1)}
                            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label="Vorheriges Bild"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}

                    <figure className="max-w-full max-h-full flex flex-col items-center">
                        <img
                            src={shot.src}
                            alt={alt}
                            title={fileName}
                            className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl select-none"
                            draggable="false"
                        />
                        {(shot.alt || '').trim() && (
                            <figcaption className="mt-3 text-center text-sm text-white/80 max-w-2xl px-4">
                                {shot.alt}
                            </figcaption>
                        )}
                    </figure>

                    {count > 1 && (
                        <button
                            onClick={() => go(1)}
                            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label="Nächstes Bild"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Mobile Navigation (große Tap-Ziele) */}
                {count > 1 && (
                    <div className="sm:hidden flex items-center justify-center gap-6 pb-6 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => go(-1)} className="p-3 rounded-full bg-white/10 text-white active:bg-white/20" aria-label="Vorheriges Bild">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={() => go(1)} className="p-3 rounded-full bg-white/10 text-white active:bg-white/20" aria-label="Nächstes Bild">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}

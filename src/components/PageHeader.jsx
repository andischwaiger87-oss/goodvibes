import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Einheitlicher Seitenkopf für alle Unterseiten:
 * kleine Zeile darüber · Überschrift (optional mit Farbverlauf) · ein kurzer Satz.
 */
export default function PageHeader({ eyebrow, title, highlight, text, children, className = '' }) {
    const reduce = useReducedMotion();
    return (
        <motion.header
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`text-center mb-8 sm:mb-12 px-2 ${className}`}
        >
            {eyebrow && (
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 mb-3">{eyebrow}</p>
            )}
            <h1 className="h1-hero text-[2.15rem] leading-[1.08] sm:text-5xl md:text-6xl">
                {title}
                {highlight && (
                    <>
                        <br />
                        <span className="text-gradient-flow">{highlight}</span>
                    </>
                )}
            </h1>
            {text && (
                <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-500 max-w-md sm:max-w-xl mx-auto leading-relaxed text-pretty">
                    {text}
                </p>
            )}
            {children}
        </motion.header>
    );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "Was bedeutet 'GoodVibes'?",
        answer: "Der Name ist Programm: 'Good' steht für soziale Projekte, die Gutes tun. 'Vibes' kommt von 'Vibe Coding' – dem Einsatz modernster KI. Wir nutzen diese Technologie, um gute Ideen nicht nur zu träumen, sondern blitzschnell und kostenlos Realität werden zu lassen."
    },
    {
        question: "Kostet mich das wirklich nichts?",
        answer: "Nein, absolut nichts. Weder das Einreichen, noch das Abstimmen, noch die spätere Umsetzung kosten Geld. Das Projekt ist meine persönliche, ehrenamtliche Initiative, um mit meinen Fähigkeiten als Entwickler etwas Gutes zu tun."
    },
    {
        question: "Wer entscheidet, welche Idee umgesetzt wird?",
        answer: "Wir alle gemeinsam. Jede eingereichte Idee wird (nach einer kurzen Spam-Prüfung) veröffentlicht. Danach kann die Community abstimmen. Das Projekt mit den meisten Stimmen gewinnt und wird von mir entwickelt."
    },
    {
        question: "Wer steckt hinter GoodVibes?",
        answer: "Das bin ich, Andreas Schwaiger. Ich bin Softwareentwickler und betreibe das Einzelunternehmen 'mosaik'. GoodVibes ist mein Herzensprojekt, losgelöst von kommerziellen Interessen."
    },
    {
        question: "Was passiert mit meiner Idee nach der Einreichung?",
        answer: "Zuerst prüfe ich kurz, ob sie den Regeln entspricht (kein Hass, gemeinnützig). Dann schalte ich sie für das Voting frei. Wenn deine Idee gewinnt, kontaktiere ich dich (falls gewünscht) oder beginne direkt mit der Planung und Umsetzung."
    },
    {
        question: "Wie wird der Datenschutz gewährleistet?",
        answer: "Wir speichern so wenig wie möglich. Beim Abstimmen nutzen wir eine anonyme ID (UUID), die lokal in deinem Browser gespeichert wird. Keine Cookies, kein Google Analytics, keine Weitergabe an Dritte. Auch Account-Zwang gibt es nicht."
    },
    {
        question: "Darf ich auch als Verein oder Organisation einreichen?",
        answer: "Ja, sehr gerne! Solange das Projekt nicht primär dazu dient, Gewinne zu erwirtschaften, sind Vereine, NGOs oder Initiativen herzlich willkommen."
    },
    {
        question: "Kann ich bei der Entwicklung helfen?",
        answer: "GoodVibes ist als Open Source Projekt geplant. Aktuell setze ich die Projekte alleine um, aber der Code wird auf GitHub veröffentlicht. Wenn du Entwickler bist, kannst du dort gerne beitragen."
    }
];

export default function FAQ() {
    return (
        <div className="max-w-3xl mx-auto py-16 px-4">
            <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6">
                    <HelpCircle className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Häufige Fragen</h1>
                <p className="text-xl text-slate-500">
                    Alles, was du über GoodVibes wissen musst.
                </p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} faq={faq} />
                ))}
            </div>
        </div>
    );
}

function FAQItem({ faq }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-blue-200 hover:shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
                <span className="text-lg font-semibold text-slate-900 pr-8">{faq.question}</span>
                <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                            {faq.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

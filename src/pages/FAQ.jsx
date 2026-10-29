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
        answer: "Nein, absolut nichts. Weder das Einreichen, noch das Abstimmen, noch die spätere Umsetzung kosten Geld. GoodVibes ist gemeinnützig und ohne Profit: meine persönliche, ehrenamtliche Initiative, um Ideen umzusetzen, die der Allgemeinheit helfen."
    },
    {
        question: "Für welche Geräte sind die Apps gedacht?",
        answer: "In erster Linie fürs Handy – dort werden die Apps im Alltag gebraucht, und von dort kommen auch die meisten Besuche. Alle Apps laufen direkt im Browser, ohne Installation aus dem App Store. Am Computer funktionieren sie ebenfalls."
    },
    {
        question: "Ab wann wird eine Idee umgesetzt?",
        answer: "Jede Idee hat ein Ziel von 100 Stimmen. Erreicht sie die Marke, kommt sie auf die Umsetzungsliste. Da GoodVibes ehrenamtlich neben meiner Arbeit läuft, setze ich eine Idee nach der anderen um – in der Reihenfolge der Stimmen. Einen fixen Termin gibt es daher nicht, aber du kannst den Fortschritt jederzeit verfolgen. Kommen mehr Menschen auf GoodVibes, kann die Marke steigen."
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
    },
    {
        question: "Welche Projektphasen gibt es bei GoodVibes?",
        answer: "GoodVibes durchläuft einen zyklischen Prozess in drei Phasen: 1. Einreichungs-Phase (Nutzer reichen Ideen ein und die Community stimmt ab), 2. Review-Phase (die Abstimmungen werden geschlossen und die Gewinner-Idee wird zur Umsetzung vorbereitet) und 3. Umsetzungs-Phase (die App wird aktiv entwickelt. Währenddessen bleibt das Voting für andere zukünftige Projekte geöffnet)."
    },
    {
        question: "Was bedeutet es, wenn ein Projekt 'In Umsetzung' ist?",
        answer: "Das Projekt hat die letzte Abstimmungsrunde gewonnen und wird nun kostenlos und ehrenamtlich entwickelt. Um Fairness zu garantieren, ist das Voting für dieses Projekt während der Entwicklung eingefroren. Auf unserer neuen 'Umsetzungs'-Seite kannst du den aktuellen Status der Entwicklung in Echtzeit mitverfolgen."
    },
    {
        question: "Was passiert nach der Fertigstellung eines Projekts?",
        answer: "Sobald ein Projekt fertiggestellt ist, veröffentlichen wir es in unserem Showcase-Bereich mit direktem Link zur fertigen App. Dort findest du auch einen transparenten Bug- und Feedback-Tracker. So können wir Fehler beheben, Kritik einholen und die App gemeinschaftlich optimieren."
    },
    {
        question: "Was ist der neue Bereich 'Apps & Community'?",
        answer: "Das ist unser gemeinsamer Treffpunkt – ähnlich wie ein App-Store mit Kommentarbereich. Dort findest du alle fertigen GoodVibes-Apps übersichtlich aufgelistet: mit Beschreibung, Funktionen, Version und einem großen Knopf zum direkten Öffnen. Unter jeder App kannst du bewerten, Wünsche äußern, Fehler melden oder einfach Fragen stellen. So entwickeln wir jede App gemeinsam weiter."
    },
    {
        question: "Muss ich mich anmelden, um mitzureden?",
        answer: "Nein. Der Community-Bereich ist komplett anonym – kein Konto, kein Name, keine E-Mail nötig. Du bekommst automatisch einen freundlichen Spitznamen und ein kleines Avatar-Bild. So kann jede und jeder sofort und ohne Hürde mitreden."
    },
    {
        question: "Was bedeutet 'BETA' bei einer App?",
        answer: "BETA heißt einfach: Die App ist noch neu und wird gerade ausprobiert. Sie funktioniert schon, aber es kann noch kleine Fehler geben. Genau deshalb gibt es die Community: Dein Feedback aus dem echten Alltag hilft uns, die App Schritt für Schritt besser zu machen. Eine App mit BETA-Kennzeichen darfst du also gerne testen – und uns sagen, was dir auffällt."
    },
    {
        question: "Wie sorgt ihr dafür, dass niemand beleidigt oder mit Spam nervt?",
        answer: "Deine Meinung darf offen und ehrlich sein – Beleidigungen, Hass und Spam haben aber keinen Platz. Ein automatischer Schutz prüft jeden Beitrag: Saubere Beiträge erscheinen sofort, auffällige werden kurz von einem Menschen geprüft, bevor sie sichtbar sind. Wer trotzdem stört, kann gesperrt werden. So bleibt der Austausch für alle freundlich und sicher."
    },
    {
        question: "Warum kann ich keine Links posten – und wie melde ich einen Fehler mit Bild?",
        answer: "Aus Sicherheitsgründen werden Links im Chat automatisch entfernt, damit niemand auf gefährliche Seiten gelockt werden kann. Beim Melden eines Fehlers darfst du aber ein Bildschirmfoto (Screenshot) anhängen – das wird automatisch sicher aufbereitet, sodass keine versteckten Daten übrig bleiben. Wer möchte, kann auch einen Code-Ausschnitt einfügen; dieser wird ausschließlich als reiner Text angezeigt und niemals ausgeführt."
    },
    {
        question: "Wie entscheidet ihr, welche Verbesserungen umgesetzt werden?",
        answer: "Damit eine App nicht mit tausend Funktionen überladen wird, entscheidet die Community mit. Bei jeder App kannst du Wünsche mit einem Klick unterstützen ('Finde ich auch'). Was die meisten Stimmen bekommt, setzen wir zuerst um. So bekommt die App genau die Verbesserungen, die wirklich vielen Menschen helfen."
    }
];

export default function FAQ() {
    return (
        <div className="max-w-3xl mx-auto py-6 sm:py-14">
            <div className="text-center mb-8 sm:mb-14">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6">
                    <HelpCircle className="w-8 h-8" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Häufige Fragen</h1>
                <p className="text-base sm:text-xl text-slate-500">
                    Alles, was du über GoodVibes wissen musst.
                </p>
            </div>

            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} faq={faq} index={index} />
                ))}
            </div>
        </div>
    );
}

function FAQItem({ faq, index }) {
    const [isOpen, setIsOpen] = useState(false);
    const panelId = `faq-antwort-${index}`;
    const buttonId = `faq-frage-${index}`;

    return (
        <div className={`elgato-card overflow-hidden transition-colors ${isOpen ? 'border-blue-200' : 'hover:border-blue-200'}`}>
            <h2 className="m-0">
                <button
                    id={buttonId}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left min-h-[64px] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 rounded-2xl"
                >
                    <span className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">{faq.question}</span>
                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </span>
                </button>
            </h2>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-slate-600 leading-relaxed max-w-[68ch]">
                            {faq.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

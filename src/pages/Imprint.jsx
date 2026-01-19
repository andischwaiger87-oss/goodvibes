import React from 'react';
import { motion } from 'framer-motion';

export default function Imprint() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto py-12 px-4"
        >
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Impressum</h1>

            <div className="space-y-8 text-slate-600 leading-relaxed">
                <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Medieninhaber / Diensteanbieter</h2>
                    <p className="font-semibold text-slate-900">Schwaiger Andreas | mosaik</p>
                    <p>Einzelunternehmen</p>
                    <p className="mt-4">
                        Niederland 162<br />
                        5091 Unken<br />
                        Salzburg, Österreich
                    </p>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p><strong>Kontakt:</strong></p>
                        <p>Tel: +43 677 640 543 47</p>
                        <p>E-Mail: <a href="mailto:hallo@mosaik-design.at" className="text-blue-600 hover:underline">hallo@mosaik-design.at</a></p>
                        <p className="mt-2 text-sm text-slate-400">
                            Web: <a href="https://mosaik-design.at/impressum/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600">mosaik-design.at</a>
                        </p>
                    </div>
                </section>

                <section className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                    <h3 className="font-bold text-blue-800 mb-2">Wichtiger Hinweis</h3>
                    <p className="text-blue-700">
                        GoodVibes ist ein rein privates, nicht-kommerzielles Projekt.
                        Es dient keinem Erwerbszweck und es wird keine Werbung geschaltet.
                        Die Umsetzung der Gewinner-Ideen erfolgt ehrenamtlich und kostenlos durch Andreas Schwaiger.
                    </p>
                </section>

                <section>
                    <h3 className="font-bold text-slate-900 mb-2">Haftung für Inhalte</h3>
                    <p className="mb-4">
                        Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                        Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
                    </p>
                    <h3 className="font-bold text-slate-900 mb-2">Haftung für Links</h3>
                    <p>
                        Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.
                        Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                    </p>
                </section>
            </div>
        </motion.div>
    );
}

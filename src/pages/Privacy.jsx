import React from 'react';
import { motion } from 'framer-motion';

export default function Privacy() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto py-12 px-4"
        >
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Datenschutzerklärung</h1>

            <div className="space-y-8 text-slate-600 leading-relaxed">
                <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">1. Datenschutz auf einen Blick</h2>
                    <p className="mb-2"><strong>Allgemeine Hinweise</strong></p>
                    <p>
                        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
                        Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                    </p>
                    <p className="mt-4">
                        <strong>Datenerfassung auf dieser Website</strong><br />
                        Wir sammeln so wenig Daten wie möglich. Es gibt keine Benutzerkonten für Abstimmende, kein Google Analytics und keine Tracking-Pixel von Werbenetzwerken.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">2. Verantwortliche Stelle</h2>
                    <p>
                        Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br /><br />
                        <strong>Schwaiger Andreas | mosaik</strong><br />
                        Niederland 162<br />
                        5091 Unken<br />
                        Österreich<br /><br />
                        E-Mail: hallo@mosaik-design.at
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">3. Welche Daten wir erfassen</h2>

                    <h3 className="font-bold text-slate-800 mt-4 mb-2">Beim Abstimmen (Voting)</h3>
                    <p>
                        Damit wir sicherstellen können, dass jede Person nur einmal pro Projekt abstimmt, speichern wir eine zufällig generierte ID (UUID) in Ihrem Browser ("Local Storage").
                        Diese ID wird an unsere Datenbank gesendet, wenn Sie abstimmen. Wir können diese ID keiner realen Person zuordnen. Sie dient rein der technischen Verhinderung von Mehrfachabstimmungen.
                    </p>

                    <h3 className="font-bold text-slate-800 mt-6 mb-2">Beim Einreichen von Ideen</h3>
                    <p>
                        Wenn Sie eine Idee einreichen, speichern wir die von Ihnen eingegebenen Daten (Titel, Beschreibung, Kategorie).
                        Der von Ihnen gewählte "Fantasiename" wird öffentlich angezeigt. Bitte verwenden Sie hier keinen Klarnamen, wenn Sie anonym bleiben möchten.
                        Es werden keine IP-Adressen dauerhaft gespeichert.
                    </p>

                    <h3 className="font-bold text-slate-800 mt-6 mb-2">Hosting</h3>
                    <p>
                        Diese Seite wird technisch über Cloudflare Pages bereitgestellt. Cloudflare verarbeitet technische Verbindungsdaten (z.B. IP-Adresse), um die Auslieferung der Webseite zu ermöglichen und Angriffe abzuwehren.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">4. Ihre Rechte</h2>
                    <p>
                        Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten (sofern vorhanden), deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.
                        Da wir für Voter keine personenbezogenen Klardaten speichern, ist eine Zuordnung oft technisch gar nicht möglich.
                        Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an uns wenden.
                    </p>
                </section>
            </div>
        </motion.div>
    );
}

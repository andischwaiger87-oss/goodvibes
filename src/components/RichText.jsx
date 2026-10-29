import React from 'react';

/**
 * Setzt Freitext aus der Datenbank lesefreundlich – OHNE den Text zu verändern.
 * Es wird nur die Darstellung angepasst:
 *  - jede Zeile wird ein eigener Absatz mit Luft dazwischen
 *  - "Beispiele:" (kurze Zeile mit Doppelpunkt) wird zur Zwischenüberschrift,
 *    die kurzen Zeilen danach zu einer Aufzählung
 *  - Einleitungen wie "Warum das wichtig ist:" am Zeilenanfang werden fett
 *  - Zeilen mit •, - oder * werden zu Aufzählungspunkten
 *  - Zeilenlänge max. ~68 Zeichen (angenehme Lesebreite)
 */
const BULLET = /^[•\-*–]\s?/;
const LEAD_IN = /^([^:.!?]{2,40}):\s+(.+)$/;

function isLabel(line) {
    return line.length <= 40 && line.endsWith(':');
}

export default function RichText({ text, className = '', size = 'base' }) {
    const raw = String(text || '').replace(/\r\n/g, '\n').trim();
    if (!raw) return null;

    const lines = raw.split('\n').map((l) => l.trim());

    // In Bausteine zerlegen
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line) { i++; continue; }

        // Aufzählung mit Zeichen
        if (BULLET.test(line)) {
            const items = [];
            while (i < lines.length && BULLET.test(lines[i])) {
                items.push(lines[i].replace(BULLET, ''));
                i++;
            }
            blocks.push({ type: 'list', items });
            continue;
        }

        // Kurze Zeile mit Doppelpunkt = Zwischenüberschrift, danach kurze Zeilen als Liste
        if (isLabel(line)) {
            blocks.push({ type: 'label', text: line });
            i++;
            const items = [];
            while (
                i < lines.length && lines[i] &&
                lines[i].length <= 220 &&
                !isLabel(lines[i]) &&
                !LEAD_IN.test(lines[i])
            ) {
                items.push(lines[i].replace(BULLET, ''));
                i++;
            }
            if (items.length >= 2) blocks.push({ type: 'list', items });
            else items.forEach((t) => blocks.push({ type: 'p', text: t }));
            continue;
        }

        blocks.push({ type: 'p', text: line });
        i++;
    }

    const textSize = size === 'sm' ? 'text-sm sm:text-[15px]' : 'text-base';

    const renderInline = (t) => {
        const m = t.match(LEAD_IN);
        if (!m) return t;
        return (<><strong className="font-semibold text-slate-900">{m[1]}:</strong> {m[2]}</>);
    };

    return (
        <div className={`max-w-[68ch] text-slate-600 ${textSize} leading-[1.7] space-y-3.5 ${className}`}>
            {blocks.map((b, bi) => {
                if (b.type === 'label') {
                    return <p key={bi} className="font-semibold text-slate-900 pt-1 !mb-1.5">{b.text}</p>;
                }
                if (b.type === 'list') {
                    return (
                        <ul key={bi} className="space-y-2">
                            {b.items.map((it, ii) => (
                                <li key={ii} className="flex items-start gap-2.5">
                                    <span className="mt-[0.7em] w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />
                                    <span>{renderInline(it)}</span>
                                </li>
                            ))}
                        </ul>
                    );
                }
                return <p key={bi}>{renderInline(b.text)}</p>;
            })}
        </div>
    );
}

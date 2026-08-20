// src/components/Seo.jsx
//
// Setzt Titel, Description, Canonical, og:url und robots je Route.
// Ohne zusaetzliche Abhaengigkeit — react-router-dom reicht.
//
// Einbau: <Seo /> in App.jsx innerhalb von <Router> und VOR <Layout>
// montieren. Die Reihenfolge ist wichtig: Effekte laufen in Baum-
// reihenfolge, dadurch kann eine einzelne Seite ueber useSeo()
// nachtraeglich ueberschreiben.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://goodvibes.mosaik-design.at';

const ROUTES = {
    '/': {
        title: 'GoodVibes — soziale App-Ideen gemeinsam umsetzen',
        description:
            'Reiche deine Idee für eine soziale App ein, stimme gemeinsam mit anderen ab — die ausgewählte Idee wird kostenlos umgesetzt. Anonym und ohne Anmeldung.',
    },
    '/submission': {
        title: 'Idee einreichen — GoodVibes',
        description:
            'Teile deine Vision für eine soziale App. Anonym, ohne Anmeldung — die Idee soll anderen Menschen oder der Umwelt helfen.',
    },
    '/voting': {
        title: 'Abstimmung — GoodVibes',
        description:
            'Entscheide mit, welche Projektidee als nächstes umgesetzt wird. Das Ergebnis siehst du erst nach deiner Stimmabgabe.',
    },
    '/progress': {
        title: 'Projekt-Fortschritt — GoodVibes',
        description:
            'Verfolge, wie die gewählte Idee der Gemeinschaft Schritt für Schritt in eine fertige App übersetzt wird.',
    },
    '/projects': {
        title: 'Realisierte Projekte — GoodVibes',
        description:
            'Alle Apps, die aus der Abstimmung hervorgegangen und kostenlos umgesetzt worden sind.',
    },
    '/apps': {
        title: 'Apps — GoodVibes',
        description:
            'Alle GoodVibes-Apps zum Ausprobieren, mit Möglichkeit zur Rückmeldung.',
    },
    '/faq': {
        title: 'Häufige Fragen — GoodVibes',
        description:
            'Antworten zu Kosten, Auswahlverfahren, Betreiber und zum Umgang mit eingereichten Ideen.',
    },
    '/imprint': {
        title: 'Impressum — GoodVibes',
        description: 'Medieninhaber, Anschrift und Kontaktdaten von GoodVibes.',
    },
    '/privacy': {
        title: 'Datenschutz — GoodVibes',
        description:
            'Informationen zur Verarbeitung personenbezogener Daten bei GoodVibes.',
    },
};

// Routen, die nicht in den Index gehoeren.
const NOINDEX_PREFIXES = ['/login', '/admin'];

// Detailrouten ohne eigenen Eintrag: sinnvoller Rueckfall,
// bis die jeweilige Seite per useSeo() ihren echten Titel setzt.
const FALLBACKS = [
    {
        test: (p) => p.startsWith('/apps/'),
        title: 'App — GoodVibes',
        description: 'Detailseite einer GoodVibes-App.',
    },
    {
        test: (p) => p.startsWith('/projects/'),
        title: 'Projekt — GoodVibes',
        description: 'Detailseite eines realisierten GoodVibes-Projekts.',
    },
];

function setMetaByName(name, content) {
    let el = document.head.querySelector(`meta[name="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setMetaByProperty(property, content) {
    let el = document.head.querySelector(`meta[property="${property}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setCanonical(href) {
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

function resolve(pathname) {
    if (ROUTES[pathname]) return ROUTES[pathname];
    const fallback = FALLBACKS.find((f) => f.test(pathname));
    if (fallback) return { title: fallback.title, description: fallback.description };
    return ROUTES['/'];
}

function applySeo(pathname, override = {}) {
    const base = resolve(pathname);
    const title = override.title || base.title;
    const description = override.description || base.description;

    const isNoindex =
        override.noindex ?? NOINDEX_PREFIXES.some((p) => pathname.startsWith(p));

    // Trailing Slash vereinheitlichen, Wurzel behaelt ihren Slash.
    const clean = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
    const url = SITE_URL + clean;

    document.title = title;
    setMetaByName('description', description);
    setMetaByName(
        'robots',
        isNoindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1'
    );
    setCanonical(url);
    setMetaByProperty('og:title', title);
    setMetaByProperty('og:description', description);
    setMetaByProperty('og:url', url);
}

/**
 * Global einmal montieren — setzt die Angaben bei jedem Routenwechsel.
 */
export default function Seo() {
    const { pathname } = useLocation();

    useEffect(() => {
        applySeo(pathname);
    }, [pathname]);

    return null;
}

/**
 * Optionaler Override fuer einzelne Seiten, vor allem fuer
 * Detailrouten mit echtem Namen aus der Datenbank.
 *
 *   useSeo({ title: `${app.name} — GoodVibes`, description: app.summary });
 *
 * Laeuft nach dem globalen Seo-Effekt und ueberschreibt dessen Werte.
 */
export function useSeo({ title, description, noindex } = {}) {
    const { pathname } = useLocation();

    useEffect(() => {
        if (!title && !description && noindex === undefined) return;
        applySeo(pathname, { title, description, noindex });
    }, [pathname, title, description, noindex]);
}

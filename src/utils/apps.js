// Hilfsfunktionen & Konstanten für den App-Store-Bereich

// Voll ausgeschriebene Tailwind-Klassen (damit Tailwind v4 sie erkennt).
export const ACCENTS = {
    blue:   { soft: 'bg-blue-50 text-blue-700 border-blue-100',     ring: 'from-blue-500 via-indigo-500 to-blue-600',   icon: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
    green:  { soft: 'bg-green-50 text-green-700 border-green-100',   ring: 'from-green-500 via-emerald-500 to-teal-600', icon: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    purple: { soft: 'bg-purple-50 text-purple-700 border-purple-100', ring: 'from-purple-500 via-fuchsia-500 to-pink-600', icon: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    amber:  { soft: 'bg-amber-50 text-amber-700 border-amber-100',   ring: 'from-amber-500 via-orange-500 to-red-500',   icon: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
};

export function getAccent(key) {
    return ACCENTS[key] || ACCENTS.blue;
}

// Kategorien / Beitragsarten in der Community (einfache, klare Sprache)
export const POST_TYPES = {
    review:   { label: 'Bewertung',      short: 'Bewertungen', color: 'bg-yellow-50 text-yellow-700 border-yellow-100', help: 'Erzähl anderen, wie dir die App gefällt.' },
    feature:  { label: 'Wunsch / Idee',  short: 'Wünsche',     color: 'bg-blue-50 text-blue-700 border-blue-100',       help: 'Was würdest du dir für die App wünschen?' },
    bug:      { label: 'Fehler melden',  short: 'Fehler',      color: 'bg-red-50 text-red-700 border-red-100',          help: 'Etwas funktioniert nicht? Beschreib es hier.' },
    question: { label: 'Frage',          short: 'Fragen',      color: 'bg-purple-50 text-purple-700 border-purple-100', help: 'Du bist dir unsicher? Frag einfach nach.' },
    praise:   { label: 'Lob & Feedback', short: 'Feedback',    color: 'bg-green-50 text-green-700 border-green-100',     help: 'Allgemeines Feedback und nette Worte.' },
};

export function getPostType(key) {
    return POST_TYPES[key] || POST_TYPES.praise;
}

// Moderations-Status eines Beitrags
export const POST_STATUS = {
    published: { label: 'Sichtbar',       color: 'bg-green-100 text-green-800 border-green-200' },
    pending:   { label: 'In Prüfung',     color: 'bg-amber-100 text-amber-800 border-amber-200' },
    hidden:    { label: 'Verborgen',      color: 'bg-slate-100 text-slate-500 border-slate-200' },
    rejected:  { label: 'Abgelehnt',      color: 'bg-red-100 text-red-700 border-red-200' },
};

// Durchschnittsbewertung
export function averageRating(app) {
    if (!app || !app.rating_count) return 0;
    return app.rating_sum / app.rating_count;
}

// Menschliche Zeitangabe ("vor 3 Tagen")
export function timeAgo(dateStr) {
    const then = new Date(dateStr).getTime();
    const diff = Math.max(0, Date.now() - then);
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'gerade eben';
    if (min < 60) return `vor ${min} Min.`;
    const h = Math.floor(min / 60);
    if (h < 24) return `vor ${h} Std.`;
    const d = Math.floor(h / 24);
    if (d < 30) return `vor ${d} Tag${d > 1 ? 'en' : ''}`;
    const mo = Math.floor(d / 30);
    return `vor ${mo} Monat${mo > 1 ? 'en' : ''}`;
}
